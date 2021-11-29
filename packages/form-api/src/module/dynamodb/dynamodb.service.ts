import { Injectable } from "@nestjs/common";
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  TransactWriteItemsCommand,
  TransactWriteItemsCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../app.config";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { ItemEntity } from "./dynamodb.entity";

type GetItemArgs = {
  table: string;
  key: [string, string?];
  consistent?: boolean;
};

type PutItemArgs<T extends ItemEntity> = {
  table: string;
  overwrite?: boolean;
  data: T;
};

type PutVersionTransactionArgs<T extends ItemEntity> = {
  table: string;
  lastVersion: string;
  nextVersion: string;
  item: T;
};

type DeleteItemArgs = {
  table: string;
  key: [string, string?];
};

@Injectable()
export class DynamodbService {
  private client: DynamoDBClient;

  constructor(private configService: ConfigService<AppConfig, true>) {
    this.client = new DynamoDBClient({
      region: configService.get("AWS_REGION"),
      ...(configService.get("LOCAL_DATABASE") && {
        credentials: {
          accessKeyId: "fake",
          secretAccessKey: "fake",
        },
        endpoint: configService.get("LOCAL_DATABASE_ENDPOINT"),
        sslEnabled: false,
        region: "local",
      }),
    });
  }

  async getItem<T extends ItemEntity>(input: GetItemArgs): Promise<T | null> {
    const item = await this.client.send(
      new GetItemCommand({
        TableName: input.table,
        Key: marshall({
          PK: input.key[0],
          SK: input.key[1],
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

  async putItem<T extends ItemEntity>(input: PutItemArgs<T>): Promise<T | null> {
    const item = await this.client.send(
      new PutItemCommand({
        TableName: input.table,
        Item: marshall(input.data),
        ConditionExpression: input.overwrite ? undefined : "attribute_not_exists(pk)",
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
              ConditionExpression: "attribute_not_exists(#Latest) or #Latest = :Latest",
              UpdateExpression:
                "SET #Latest = :NewVersion, #CreatedAt = :CreatedAt, #CreatedBy = :CreatedBy, #Data = :Data",
              ExpressionAttributeNames: {
                "#Latest": "Latest",
                "#CreatedAt": "CreatedAt",
                "#CreatedBy": "CreatedBy",
                "#Data": "Data",
              },
              ExpressionAttributeValues: marshall({
                ":Latest": input.lastVersion,
                ":NewVersion": input.nextVersion,
                ":CreatedAt": input.item.CreatedBy,
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
          PK: input.key[0],
          SK: input.key[1],
        }),
      })
    );
    if (item.Attributes) {
      return unmarshall(item.Attributes) as T;
    } else {
      return null;
    }
  }
}
