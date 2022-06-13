import { Injectable, Logger } from "@nestjs/common";
import {
  BatchWriteItemCommand,
  BatchWriteItemCommandOutput,
  ConditionalCheckFailedException,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  paginateQuery,
  Put,
  PutItemCommand,
  ScanCommand,
  TransactionCanceledException,
  TransactionConflictException,
  TransactionInProgressException,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandOutput,
  Update,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ItemEntity } from "./dynamodb.entity";
import { DynamoDbClientProvider } from "./dynamodb.client";
import { EXPONENTIAL_BACKOFF_RETRIES } from "./dynamodb.constants";
import * as assert from "assert";

export type GetItemArgs = {
  table: string;
  PK: string;
  SK?: string;
  consistent?: boolean;
};

export type QueryItemArgs = {
  table: string;
  index?: `GSI${number}`;
  reverse?: boolean;
  keyCondition: string;
  filterExpression?: string;
  expressionNames: { [key: string]: string };
  expressionValues: { [key: string]: string | number };
};

export type PutItemArgs<T extends ItemEntity> = {
  table: string;
  item: T;
  ignoreOld?: boolean;
};

export type CreateItemArgs<T extends ItemEntity> = {
  table: string;
  item: T;
};

export type ConditionallyPutItemsTransactionArgs = {
  table: string;
  key: { PK: string; SK: string };
  version: number;
  putItems?: ItemEntity[];
  conditionalPutItems?: ItemEntity[];
  idempotencyToken?: string;
};

export type PutSemanticallyVersionedTransactionArgs<T extends ItemEntity> = {
  table: string;
  lastVersion: string;
  nextVersion: string;
  item: T;
};

export enum PutItemFailReason { // TODO: Submit PR to ts-pattern updating docs: https://github.com/gvergnaud/ts-pattern/issues/58 or replace enum with strings: https://stackoverflow.com/questions/40275832/typescript-has-unions-so-are-enums-redundant/60041791#60041791
  PUT_FAILED_UNKNOWN = "PUT_FAILED_UNKNOWN",
  TRANSACTION_CANCELLED_UNKNOWN = "TRANSACTION_CANCELLED_UNKNOWN",
  TRANSACTION_FAILED_UNKNOWN = "TRANSACTION_FAILED_UNKNOWN",
  TRANSACTION_CONFLICT = "TRANSACTION_CONFLICT",
  ITEM_ALREADY_EXISTS_AT_VERSION = "ITEM_ALREADY_EXISTS_AT_VERSION",
  CONSTRAINTS_ALREADY_EXIST = "CONSTRAINTS_ALREADY_EXIST",
}

type PutItemSuccess = { succeeded: true };
type PutItemExists = {
  succeeded: false;
  reason: PutItemFailReason.ITEM_ALREADY_EXISTS_AT_VERSION;
};

type PutItemTransactionConflict = {
  succeeded: false;
  reason: PutItemFailReason.TRANSACTION_CONFLICT;
};

type PutItemTransactionCancelledUnknown = {
  succeeded: false;
  reason: PutItemFailReason.TRANSACTION_CANCELLED_UNKNOWN;
  error: TransactionCanceledException;
};

type PutItemTransactionFailedUnknown = {
  succeeded: false;
  reason: PutItemFailReason.TRANSACTION_FAILED_UNKNOWN;
  error: Error;
};

type PutItemConstraintsExist = {
  succeeded: false;
  reason: PutItemFailReason.CONSTRAINTS_ALREADY_EXIST;
  existingConstraints: string[];
};

type PutItemFailedUnknown = {
  succeeded: false;
  reason: PutItemFailReason.PUT_FAILED_UNKNOWN;
  error: Error;
};

type PutItemResponse =
  | PutItemSuccess
  | PutItemExists
  | PutItemTransactionConflict
  | PutItemTransactionCancelledUnknown
  | PutItemTransactionFailedUnknown
  | PutItemConstraintsExist
  | PutItemFailedUnknown;

export type PutVersionedArgs<T extends ItemEntity> = {
  table: string;
  item: T;
  lastVersion: number;
  addedConstraints?: Map<string, ItemEntity>;
  removedConstraints?: { PK: string; SK: string }[];
  idempotencyToken?: string;
};

export type DeleteVersionedArgs = {
  table: string;
  key: { PK: string; SK: string };
  constraints: { PK: string; SK: string }[];
  idempotencyToken?: string;
};

export type DeleteItemArgs = {
  table: string;
  PK: string;
  SK?: string;
};

export type BulkDeleteItemsArgs = {
  table: string;
  items: {
    PK: string;
    SK?: string;
  }[];
};

@Injectable()
export class DynamodbService {
  private readonly client: DynamoDBClient;

  constructor(private clientProvider: DynamoDbClientProvider) {
    this.client = this.clientProvider.getClient();
  }

  async getItem<T extends ItemEntity>(input: GetItemArgs): Promise<T | null> {
    const item = await this.client.send(
      new GetItemCommand({
        TableName: input.table,
        Key: marshall({
          PK: input.PK,
          SK: input.SK,
        }),
        ConsistentRead: input.consistent,
      })
    );
    if (item.Item) {
      return unmarshall(item.Item) as T;
    } else {
      return null;
    }
  }

  async *queryItems<T extends ItemEntity>(input: QueryItemArgs): AsyncGenerator<T> {
    const paginator = paginateQuery(
      { client: this.client },
      {
        TableName: input.table,
        IndexName: input.index,
        ScanIndexForward: !input.reverse,
        KeyConditionExpression: input.keyCondition,
        FilterExpression: input.filterExpression,
        ExpressionAttributeNames: input.expressionNames,
        ExpressionAttributeValues: marshall(input.expressionValues),
      }
    );
    for await (const page of paginator) {
      if (!page.Items) {
        break;
      }
      for (const item of page.Items) {
        yield Promise.resolve(unmarshall(item) as T);
      }
    }
  }

  async putItem<T extends ItemEntity>(input: PutItemArgs<T>): Promise<T | null> {
    const item = await this.client.send(
      new PutItemCommand({
        TableName: input.table,
        Item: marshall(input.item),
        ReturnValues: input.ignoreOld ? undefined : "ALL_OLD",
      })
    );
    if (!input.ignoreOld && item.Attributes) {
      return unmarshall(item.Attributes) as T;
    } else {
      return null;
    }
  }

  async createItem<T extends ItemEntity>(input: CreateItemArgs<T>): Promise<T | null> {
    const item = await this.client.send(
      new PutItemCommand({
        TableName: input.table,
        Item: marshall(input.item),
        ConditionExpression: "attribute_not_exists(#Id)",
        ExpressionAttributeNames: {
          "#Id": "Id",
        },
        ReturnValues: "ALL_OLD",
      })
    );
    if (item.Attributes) {
      return unmarshall(item.Attributes) as T;
    } else {
      return null;
    }
  }

  async conditionallyPutItemsTransaction(input: ConditionallyPutItemsTransactionArgs) {
    return this.client.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            ConditionCheck: {
              TableName: input.table,
              Key: marshall(input.key),
              ConditionExpression: "#Version = :Version",
              ExpressionAttributeNames: {
                "#Version": "Version",
              },
              ExpressionAttributeValues: marshall({
                ":Version": input.version,
              }),
            },
          },
          ...(input.putItems ?? []).map((item) => ({
            Put: {
              TableName: input.table,
              Item: marshall(item),
            },
          })),
          ...(input.conditionalPutItems ?? []).map((item) => ({
            Put: {
              TableName: input.table,
              ConditionExpression: "attribute_not_exists(#Id)",
              Item: marshall(item),
            },
          })),
        ],
        ClientRequestToken: input.idempotencyToken,
      })
    );
  }

  async putSemanticallyVersionedItem<T extends ItemEntity>(
    input: PutSemanticallyVersionedTransactionArgs<T>
  ): Promise<TransactWriteItemsCommandOutput> {
    return this.client.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Update: {
              TableName: input.table,
              Key: marshall({
                PK: input.item.PK,
                SK: `${input.item.SK}:latest`,
              }),
              ConditionExpression: "attribute_not_exists(#Latest) or #Latest >= :Latest",
              UpdateExpression:
                "SET #Latest = :NewVersion, #Id = :Id, #ItemType = :ItemType, #CreatedAt = :CreatedAt, #CreatedBy = :CreatedBy, #Data = :Data",
              ExpressionAttributeNames: {
                "#Latest": "Latest",
                "#Id": "Id",
                "#ItemType": "ItemType",
                "#CreatedAt": "CreatedAt",
                "#CreatedBy": "CreatedBy",
                "#Data": "Data",
              },
              ExpressionAttributeValues: marshall({
                ":Latest": input.lastVersion,
                ":NewVersion": input.nextVersion,
                ":Id": input.item.Id,
                ":ItemType": input.item.ItemType,
                ":CreatedAt": input.item.CreatedAt,
                ":CreatedBy": input.item.CreatedBy,
                ":Data": input.item.Data,
              }),
            },
          },
          {
            Put: {
              TableName: input.table,
              Item: marshall({
                ...input.item,
                SK: `${input.item.SK}:${input.nextVersion}`,
              }),
              ConditionExpression: "attribute_not_exists(#PK) and attribute_not_exists(#SK)",
              ExpressionAttributeNames: {
                "#PK": "PK",
                "#SK": "SK",
              },
            },
          },
        ],
      })
    );
  }

  async putVersionedItemAndConstraints<T extends ItemEntity>(input: PutVersionedArgs<T>): Promise<PutItemResponse> {
    const expressionAttributes = Object.entries(input.item).reduce(
      (acc, [key, value]) => {
        if (!["PK", "SK", "Version", "Increment"].includes(key)) {
          const attributeNameKey = `#${key}`;
          const attributeValueKey = `:${key}`;
          acc.UpdateExpression.push(`${attributeNameKey} = ${attributeValueKey}`);
          acc.ExpressionAttributeNames[attributeNameKey] = key;
          acc.ExpressionAttributeValues[attributeValueKey] = value;
        }
        return acc;
      },
      {
        UpdateExpression: [] as string[],
        ExpressionAttributeNames: {} as { [k: string]: string },
        ExpressionAttributeValues: {} as { [k: string]: unknown },
      }
    );

    const updateItemInput: Update = {
      TableName: input.table,
      Key: marshall({
        PK: input.item.PK,
        SK: input.item.SK,
      }),
      ConditionExpression: "attribute_not_exists(#Version) or #Version = :Version",
      UpdateExpression: `ADD #Version :Increment SET ${expressionAttributes.UpdateExpression.join(", ")}`,
      ExpressionAttributeNames: {
        "#Version": "Version",
        ...expressionAttributes.ExpressionAttributeNames,
      },
      ExpressionAttributeValues: marshall({
        ":Version": input.lastVersion,
        ":Increment": 1,
        ...expressionAttributes.ExpressionAttributeValues,
      }),
    };

    if (
      (input.addedConstraints && input.addedConstraints.size > 0) ||
      (input.removedConstraints && input.removedConstraints.length > 0)
    ) {
      const addedConstraints: [string, Put][] = Array.from((input.addedConstraints ?? new Map()).entries()).map(
        ([name, item]) => [
          name,
          {
            TableName: input.table,
            Item: marshall(item),
            ConditionExpression: "attribute_not_exists(#Id)",
            ExpressionAttributeNames: {
              "#Id": "Id",
            },
          },
        ]
      );
      const transactionItems = [
        {
          Update: {
            ...updateItemInput,
          },
        },
        ...addedConstraints.map((constraint) => ({
          Put: constraint[1],
        })),
        ...(input.removedConstraints ?? []).map((constraint) => ({
          Delete: {
            TableName: input.table,
            Key: marshall(constraint),
          },
        })),
      ];

      return await this.client
        .send(
          new TransactWriteItemsCommand({
            TransactItems: transactionItems,
            ClientRequestToken: input.idempotencyToken,
          })
        )
        .then(() => ({ succeeded: true } as PutItemSuccess))
        .catch((error) => {
          if (error instanceof TransactionCanceledException) {
            if (
              error.CancellationReasons === undefined ||
              error.CancellationReasons.length !== transactionItems.length
            ) {
              return {
                succeeded: false,
                reason: PutItemFailReason.TRANSACTION_CANCELLED_UNKNOWN,
                error,
              };
            } else if (error.CancellationReasons[0].Code === "ConditionalCheckFailed") {
              return { succeeded: false, reason: PutItemFailReason.ITEM_ALREADY_EXISTS_AT_VERSION };
            }
            const failedAdded = [];
            for (const [index, reason] of error.CancellationReasons.slice(1).entries()) {
              if (![undefined, "None", "ConditionalCheckFailed"].includes(reason.Code)) {
                return { succeeded: false, reason: PutItemFailReason.TRANSACTION_CANCELLED_UNKNOWN, error };
              } else {
                const addedConstraint = addedConstraints[index];
                if (addedConstraint !== undefined) {
                  failedAdded.push(addedConstraint[0]);
                } else {
                  return {
                    succeeded: false,
                    reason: PutItemFailReason.TRANSACTION_CANCELLED_UNKNOWN,
                    error,
                  };
                }
              }
            }
            return {
              succeeded: false,
              reason: PutItemFailReason.CONSTRAINTS_ALREADY_EXIST,
              existingConstraints: failedAdded,
            };
          } else if (error instanceof TransactionConflictException || error instanceof TransactionInProgressException) {
            return { succeeded: false, reason: PutItemFailReason.TRANSACTION_CONFLICT };
          }
          return { succeeded: false, reason: PutItemFailReason.TRANSACTION_FAILED_UNKNOWN, error };
        });
    } else {
      return await this.client
        .send(new UpdateItemCommand(updateItemInput))
        .then(() => ({ succeeded: true } as PutItemSuccess))
        .catch((error) => {
          if (error instanceof ConditionalCheckFailedException) {
            return { succeeded: false, reason: PutItemFailReason.ITEM_ALREADY_EXISTS_AT_VERSION };
          } else {
            return { succeeded: false, reason: PutItemFailReason.PUT_FAILED_UNKNOWN, error };
          }
        });
    }
  }

  async deleteVersionedItemAndConstraints(input: DeleteVersionedArgs) {
    await this.client.send(
      new TransactWriteItemsCommand({
        TransactItems: [
          {
            Delete: {
              TableName: input.table,
              Key: marshall(input.key),
            },
          },
          ...input.constraints.map((constraint) => ({
            Delete: {
              TableName: input.table,
              Key: marshall(constraint),
            },
          })),
        ],
        ClientRequestToken: input.idempotencyToken,
      })
    );
  }

  async deleteItem<T extends ItemEntity>(input: DeleteItemArgs): Promise<T> {
    const item = await this.client.send(
      new DeleteItemCommand({
        TableName: input.table,
        Key: marshall({
          PK: input.PK,
          SK: input.SK,
        }),
        ReturnValues: "ALL_OLD",
      })
    );
    if (item.Attributes === undefined) {
      throw Error("Invalid response when deleting item using ALL_OLD");
    }
    return unmarshall(item.Attributes) as T;
  }

  async bulkDeleteItems(input: BulkDeleteItemsArgs): Promise<{ PK: string; SK?: string }[]> {
    assert(input.items.length <= 25, "Cannot delete > 25 items");

    let remainingItems: BatchWriteItemCommandOutput["UnprocessedItems"] = {
      [input.table]: input.items.map((item) => ({
        DeleteRequest: {
          Key: marshall({ PK: item.PK, SK: item.SK }),
        },
      })),
    };

    for (let i = 1; i < EXPONENTIAL_BACKOFF_RETRIES; i++) {
      const response: BatchWriteItemCommandOutput = await this.client.send(
        new BatchWriteItemCommand({
          RequestItems: remainingItems,
        })
      );

      if (response.UnprocessedItems?.[input.table] === undefined) {
        return [];
      }

      remainingItems = response.UnprocessedItems;

      await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000 * (Math.random() + 1)));
    }

    return (remainingItems?.[input.table] ?? []).map(
      (operation) => unmarshall(operation?.DeleteRequest?.Key ?? {}) as { PK: string; SK?: string }
    );
  }

  async scanTable(table: string): Promise<ItemEntity[]> {
    return this.client
      .send(
        new ScanCommand({
          TableName: table,
        })
      )
      .then((response) => (response.Items ?? []).map((item) => unmarshall(item) as ItemEntity));
  }
}

export class DynamodbLogger extends Logger {
  public info(message: any, context?: string): void {
    super.debug(message, context);
  }
}
