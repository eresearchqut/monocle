import { Injectable, Logger } from "@nestjs/common";
import {
  BatchWriteItemCommand,
  BatchWriteItemCommandOutput,
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  paginateQuery,
  PutItemCommand,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandOutput,
  UpdateItemCommand,
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ItemEntity, VersionedItemEntity } from "./dynamodb.entity";
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

export type PutItemsTransactionArgs<T extends ItemEntity> = {
  table: string;
  key: { PK: string; SK: string };
  version: number;
  putItems: ItemEntity[];
  idempotencyToken?: string;
};

export type PutSemanticallyVersionedTransactionArgs<T extends ItemEntity> = {
  table: string;
  lastVersion: string;
  nextVersion: string;
  item: T;
};

export type PutVersionedArgs<T extends ItemEntity> = {
  table: string;
  lastVersion: number;
  item: T;
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

  async putItemsTransaction<T extends ItemEntity>(input: PutItemsTransactionArgs<T>) {
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
          ...input.putItems.map((item) => ({
            Put: {
              TableName: input.table,
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

  async putVersionedItem<T extends ItemEntity>(
    input: PutVersionedArgs<T>
  ): Promise<{ created: boolean; item?: VersionedItemEntity<T["Data"], T["ItemType"]> }> {
    const expressionAttributes = Object.entries(input.item).reduce(
      (acc, [key, value]) => {
        if (key !== "PK" && key !== "SK" && key !== "Version" && key !== "Increment") {
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

    const item: UpdateItemCommandOutput | false = await this.client
      .send(
        new UpdateItemCommand({
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
          ReturnValues: "ALL_OLD",
        })
      )
      .catch((err) => (err.code === "ConditionalCheckFailed" ? false : Promise.reject(err)));

    if (item === false) {
      return { created: false };
    } else {
      return {
        created: true,
        item: item.Attributes ? (unmarshall(item.Attributes) as VersionedItemEntity) : undefined,
      };
    }
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
}

export class DynamodbLogger extends Logger {
  public info(message: any, context?: string): void {
    super.debug(message, context);
  }
}
