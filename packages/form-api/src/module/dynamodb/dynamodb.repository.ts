import { Injectable, Logger } from "@nestjs/common";
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  paginateQuery,
  PutItemCommand,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ItemEntity } from "./dynamodb.entity";
import { DynamoDbClientProvider } from "./dynamodb.client";

type GetItemArgs = {
  table: string;
  PK: string;
  SK?: string;
  consistent?: boolean;
};

type GSI = "GSI-1" | "GSI-2";

type QueryItemArgs = {
  table: string;
  index?: GSI;
  reverse?: boolean;
  keyCondition: string;
  filterExpression?: string;
  expressionNames: { [key: string]: string };
  expressionValues: { [key: string]: string | number };
};

type PutItemArgs<T extends ItemEntity> = {
  table: string;
  item: T;
};

type CreateItemArgs<T extends ItemEntity> = {
  table: string;
  item: T;
};

type PutVersionTransactionArgs<T extends ItemEntity> = {
  table: string;
  lastVersion: string;
  nextVersion: string;
  item: T;
};

type DeleteItemArgs = {
  table: string;
  PK: string;
  SK?: string;
};

@Injectable()
export class DynamodbRepository {
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
        ReturnValues: "ALL_OLD",
      })
    );
    if (item.Attributes) {
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
        ConditionExpression: "attribute_not_exists(#PK) and attribute_not_exists(#SK)",
        ExpressionAttributeNames: {
          "#PK": "PK",
          "#SK": "SK",
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

  async putVersionedItem<T extends ItemEntity>(
    input: PutVersionTransactionArgs<T>
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

  async deleteItem<T extends ItemEntity>(input: DeleteItemArgs): Promise<T | null> {
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
    if (item.Attributes) {
      return unmarshall(item.Attributes) as T;
    } else {
      return null;
    }
  }
}

export class DynamodbLogger extends Logger {
  public info(message: any, context?: string): void {
    super.debug(message, context);
  }
}
