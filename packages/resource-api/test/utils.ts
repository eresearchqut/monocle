import * as yaml from "js-yaml";
import * as fs from "fs";
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema";
import { INestApplication, Injectable } from "@nestjs/common";
import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { Test } from "@nestjs/testing";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AppConfig, validateConfigOverride } from "../src/app.config";
import { DynamoDbClientProvider } from "../src/module/dynamodb/dynamodb.client";
import { buildApp } from "../src/app.build";
import {
  DescribeStreamCommand,
  DynamoDBStreamsClient,
  GetRecordsCommand,
  GetShardIteratorCommand,
  ListStreamsCommand,
} from "@aws-sdk/client-dynamodb-streams";
import { DynamoDBRecord } from "aws-lambda";
import { v4 as uuid } from "uuid";
import { DynamodbService } from "../src/module/dynamodb/dynamodb.service";

// const localClientConfig = {
//   region: "local",
//   credentials: {
//     accessKeyId: "fake",
//     secretAccessKey: "fake",
//   },
//   endpoint: `http://localhost:8000`,
// };

const localClientConfig = {
  region: "local",
  credentials: {
    accessKeyId: "fake",
    secretAccessKey: "fake",
  },
  endpoint: `http://${(global as any).__TESTCONTAINERS_DYNAMODB_IP__}:${
    (global as any).__TESTCONTAINERS_DYNAMODB_PORT_8000__
  }`,
};

const getTableInput = (name: string) => {
  const template = yaml.load(fs.readFileSync("template.yaml", "utf8"), {
    schema: CLOUDFORMATION_SCHEMA,
  }) as any;
  const sourceTable = template.Resources["ResourceTable"].Properties;
  return {
    ...sourceTable,
    TableName: name,
  };
};
export const generateResourceName = () => `TestResource_${Date.now()}`;
export const initApp = async ({
  modules,
  existingTableName,
  tickDynamodb,
}: {
  modules: any[];
  existingTableName?: string;
  tickDynamodb?: boolean;
}): Promise<{
  app: INestApplication;
  tableName: string;
  tickFns: { tick: () => Promise<void>; waitForTick: () => Promise<void>; done: () => Promise<void> };
}> => {
  const tableName = existingTableName ?? `E2E_Resource_${Date.now()}_${uuid()}`;
  const dynamodbClient = new DynamoDBClient(localClientConfig);

  if (existingTableName === undefined) {
    await dynamodbClient.send(new CreateTableCommand(getTableInput(tableName))).catch((e) => {
      console.error(e);
      throw new Error("Failed to create table for tests. Is dynamodb-local running?");
    });
  }

  @Injectable()
  class TestDynamodbClientProvider {
    getClient(): DynamoDBClient {
      return dynamodbClient;
    }
  }

  let moduleBuilder = Test.createTestingModule({
    imports: [
      ...modules,
      ConfigModule.forRoot({
        cache: true,
        expandVariables: true,
        ignoreEnvFile: true,
        isGlobal: true,
        validate: validateConfigOverride({
          RESOURCE_TABLE: tableName, // TODO: suffix with org and project from claims context
          VALIDATE_METADATA_ON_READ: true,
          VALIDATE_METADATA_ON_WRITE: true,
          VALIDATE_RESOURCE_ON_READ: true,
          VALIDATE_RESOURCE_ON_WRITE: true,
        }),
      }),
    ],
  })
    .overrideProvider(DynamoDbClientProvider)
    .useClass(TestDynamodbClientProvider);

  let tick = () => Promise.resolve();
  let waitForTick = () => Promise.resolve();
  let done = () => Promise.resolve();
  if (tickDynamodb) {
    const waitLock = new AwaitLock();
    const tickLock = new AwaitLock();

    // Start with waitLock (require a tick before first return)
    await waitLock.acquireAsync();

    let finished = false;

    tick = () => {
      if (finished) {
        return Promise.resolve();
      }
      return tickLock.acquireAsync().then(() => {
        if (finished) {
          tickLock.release();
        }
        waitLock.release();
      });
    };
    waitForTick = () => {
      if (finished) {
        return Promise.resolve();
      }
      return waitLock.acquireAsync().then(() => {
        if (finished) {
          waitLock.release();
        }
        tickLock.release();
      });
    };
    done = async () => {
      finished = true;
      if (!tickLock.tryAcquire()) {
        tickLock.release();
      }

      if (!waitLock.tryAcquire()) {
        waitLock.release();
      }
    };

    moduleBuilder = moduleBuilder.overrideProvider(DynamodbService).useClass(
      tickingDynamodbServiceFactory({
        waitForTick,
      })
    );
  }

  const moduleRef = await moduleBuilder.compile();

  const app = moduleRef.createNestApplication();
  buildApp(app);
  await app.init();
  return { app, tableName, tickFns: { tick, waitForTick, done } };
};

export const teardownApp = async (app: INestApplication) => {
  const config: ConfigService<AppConfig, true> = await app.get(ConfigService);
  const tableName = config.get("RESOURCE_TABLE");

  const dynamodbClient = new DynamoDBClient(localClientConfig);

  await dynamodbClient.send(
    new DeleteTableCommand({
      TableName: tableName,
    })
  );

  await app.close();
};

const tickingDynamodbServiceFactory = ({
  waitForTick,
  tickEachAsyncIterableNext,
}: {
  waitForTick: () => Promise<void>;
  tickEachAsyncIterableNext?: boolean;
}) => {
  return class TickingDynamodbService extends DynamodbService {
    constructor(clientProvider: DynamoDbClientProvider) {
      super(clientProvider);

      const base = Object.getPrototypeOf(Object.getPrototypeOf(this));

      for (const method of Object.getOwnPropertyNames(base).filter(
        (name) => name !== "constructor"
      ) as (keyof DynamodbService)[]) {
        const original = base[method];

        (this as Record<string, any>)[method] = (...args: any[]) => {
          const result = original.apply(this, args);
          if (result[Symbol.asyncIterator]) {
            return {
              [Symbol.asyncIterator]: () => {
                const originalIterator = result[Symbol.asyncIterator]();
                let ticked = false;
                return {
                  next: async () => {
                    if (!ticked || tickEachAsyncIterableNext) {
                      await waitForTick();
                    }
                    ticked = true;
                    const { value, done } = await originalIterator.next();
                    return { value, done };
                  },
                };
              },
            };
          } else if (result instanceof Promise) {
            return waitForTick().then(() => result);
          } else {
            throw new Error("Unsupported result type");
          }
        };
      }
    }
  };
};

// https://stackoverflow.com/a/20871714/7435520
const permutations = <T>(inputArr: T[]): T[][] => {
  const result: T[][] = [];

  const permute = (arr: T[], m: T[] = []) => {
    if (arr.length === 0) {
      result.push(m);
    } else {
      for (let i = 0; i < arr.length; i++) {
        const curr = arr.slice();
        const next = curr.splice(i, 1);
        permute(curr.slice(), m.concat(next));
      }
    }
  };

  permute(inputArr);

  return result;
};

type Tickable = { fn: () => Promise<any>; tick: () => Promise<void> };
type TickableCreator = () => Promise<Tickable>;

class IsolationError extends Error {
  constructor(
    public ticks: { tickable: number; executed: boolean }[],
    public result: any,
    public allowedResults: any[]
  ) {
    super(`Ticks: [${ticks.map((t) => t.tickable)}] caused unexpected result: ${JSON.stringify(result)}`);
  }
}

const flushTickable = async ({ fn, tick }: Tickable) => {
  let result;
  fn().then((value) => {
    result = value;
  });

  while (result === undefined) {
    await tick();
  }
  return result;
};

export const isolationCombinations = async (
  options: { comparisonFunction?: (result1: any, result2: any) => boolean; maxIterations?: number },
  ...tickableCreators: TickableCreator[]
): Promise<void> => {
  if (tickableCreators.length === 0) {
    return;
  }

  // Calculate possible results of all *serially* executed permutations
  const allowedResults: any[] = [];
  for (const permutation of permutations(tickableCreators)) {
    for (const tickableCreator of permutation.slice(0, -1)) {
      await flushTickable(await tickableCreator());
    }
    const lastTickableCreator = permutation[permutation.length - 1];
    allowedResults.push(await flushTickable(await lastTickableCreator()));
  }

  // Initialise stack with empty first combination
  const stack: {
    tickables?: { tickable: Tickable; result?: any }[];
    ticks: { tickable: number; executed: boolean }[];
    resultOrder: number[];
  }[] = [{ ticks: [], resultOrder: [] }];

  for (let i = 0; i < (options.maxIterations ?? Infinity); i++) {
    // Pop combination from stack
    const combination = stack.pop();
    if (combination === undefined) {
      break;
    }
    if (i % 500 === 0) {
      console.log("Stack iteration", {
        i,
        stack: stack.map((c) => c.ticks.map((t) => t.tickable).join(",")),
        ticks: combination.ticks.map((t) => t.tickable).join(","),
      });
    }

    // Create tickables if combination is from scratch
    if (combination.tickables === undefined) {
      combination.tickables = await Promise.all(
        tickableCreators.map(async (creator) => {
          const tickable = await creator();
          const response = { tickable, result: undefined };
          tickable.fn().then((result) => {
            response.result = result;
          });
          return response;
        })
      );
    }

    // Run outstanding ticks
    for (const tick of combination.ticks) {
      if (tick.executed) {
        continue;
      }
      const tickable = combination.tickables[tick.tickable];
      await tickable.tickable.tick();
      tick.executed = true;

      // TODO: mechanism to deal with last tick

      if (tickable.result !== undefined) {
        combination.resultOrder.push(tick.tickable);
      }
    }

    // If all finished
    if (combination.tickables.every((tickable) => tickable.result !== undefined)) {
      // Check last result is in allowedResults
      const lastResult = combination.tickables[combination.resultOrder[combination.resultOrder.length - 1]].result;
      const inAllowedResults = allowedResults.some((value) => {
        if (options.comparisonFunction) {
          return options.comparisonFunction(lastResult, value);
        } else {
          return lastResult == value;
        }
      });

      if (!inAllowedResults) {
        throw new IsolationError(combination.ticks, lastResult, allowedResults);
      }

      continue;
    } // TODO: strongly consistent variation

    // Find unfinished tickables
    const [firstUnfinishedIndex, ...remainingUnfinishedIndexes] = combination.tickables.reduce(
      (acc, tickable, index) => {
        if (tickable.result === undefined) {
          acc.push(index);
        }
        return acc;
      },
      [] as number[]
    );

    // Add new combination to stack that is the same as current combination, plus one tick
    for (const tickableIndex of remainingUnfinishedIndexes) {
      stack.push({
        ticks: combination.ticks
          .map((tick) => ({ tickable: tick.tickable, executed: false }))
          .concat([{ tickable: tickableIndex, executed: false }]),
        resultOrder: [],
      });
    }

    // Add current combination to the stack, plus one tick
    combination.ticks.push({ tickable: firstUnfinishedIndex, executed: false });
    stack.push(combination);
  }
};

export const simulateStream = async (
  port: number,
  table: string,
  callback: (record: DynamoDBRecord) => Promise<unknown>
) => {
  const client = new DynamoDBStreamsClient(localClientConfig);

  const streams = await client.send(new ListStreamsCommand({ TableName: table }));
  const streamDetails = streams.Streams?.pop();
  if (streamDetails === undefined) {
    throw new Error("No stream found");
  }
  const streamDescription = await client.send(new DescribeStreamCommand({ StreamArn: streamDetails.StreamArn }));
  for (const shard of streamDescription.StreamDescription?.Shards ?? []) {
    let shardIterator = (
      await client.send(
        new GetShardIteratorCommand({
          ShardId: shard.ShardId,
          ShardIteratorType: "TRIM_HORIZON",
          StreamArn: streamDetails.StreamArn,
        })
      )
    )?.ShardIterator;
    while (shardIterator !== undefined) {
      const records = await client.send(new GetRecordsCommand({ ShardIterator: shardIterator }));
      shardIterator = records.NextShardIterator;
      if (records.Records === undefined || records.Records.length === 0) {
        break;
      }
      for (const record of records.Records ?? []) {
        const approximateCreationDateTime = record.dynamodb?.ApproximateCreationDateTime?.valueOf();

        await callback({
          ...record,
          dynamodb: {
            ...record.dynamodb,
            ApproximateCreationDateTime: approximateCreationDateTime,
          },
        } as DynamoDBRecord); // TODO: fix type
      }
    }
  }
};

/**
 * A mutex lock for coordination across async functions
 */
export default class AwaitLock {
  private _acquired = false;
  private _waitingResolvers: (() => void)[] = [];

  /**
   * Acquires the lock, waiting if necessary for it to become free if it is already locked. The
   * returned promise is fulfilled once the lock is acquired.
   *
   * After acquiring the lock, you **must** call `release` when you are done with it.
   */
  acquireAsync(): Promise<void> {
    if (!this._acquired) {
      this._acquired = true;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this._waitingResolvers.push(resolve);
    });
  }

  /**
   * Acquires the lock if it is free and otherwise returns immediately without waiting. Returns
   * `true` if the lock was free and is now acquired, and `false` otherwise,
   */
  tryAcquire(): boolean {
    if (!this._acquired) {
      this._acquired = true;
      return true;
    }

    return false;
  }

  /**
   * Releases the lock and gives it to the next waiting acquirer, if there is one. Each acquirer
   * must release the lock exactly once.
   */
  release(): void {
    if (!this._acquired) {
      throw new Error(`Cannot release an unacquired lock`);
    }

    if (this._waitingResolvers.length > 0) {
      const resolve = this._waitingResolvers.shift()!;
      resolve();
    } else {
      this._acquired = false;
    }
  }
}
