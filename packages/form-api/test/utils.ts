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
export const initApp = async (modules: any[]): Promise<INestApplication> => {
  const tableName = `E2E_Resource_${Date.now()}_${uuid()}`; // TODO: pass table name in context. Tables need org uuid, environment, audit, search etc. in suffix

  const dynamodbClient = new DynamoDBClient(localClientConfig);

  await dynamodbClient.send(new CreateTableCommand(getTableInput(tableName))).catch((e) => {
    console.error(e);
    throw new Error("Failed to create table for tests. Is dynamodb-local running?");
  });

  @Injectable()
  class TestDynamodbClientProvider {
    getClient(): DynamoDBClient {
      return dynamodbClient;
    }
  }

  const moduleRef = await Test.createTestingModule({
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
    .useClass(TestDynamodbClientProvider)
    .compile();

  const app = moduleRef.createNestApplication();
  buildApp(app);
  await app.init();
  return app;
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
