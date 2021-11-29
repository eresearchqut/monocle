import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  paginateQuery,
  PutItemCommand,
  PutItemCommandOutput,
  TransactWriteItemsCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-2",

  // Testing config
  ...(process.env.NODE_ENV === "test" && {
    accessKeyId: "fake",
    secretAccessKey: "fake",
    endpoint: "http://localhost:8000",
    sslEnabled: false,
    region: "local",
  }),
});

export const rootTable = (registry: string) => `FutureState_${registry}_Root`;
export const historyTable = (registry: string) => `FutureState_${registry}_History`;

export enum GSI {
  GSI1 = "GSI1",
}

export interface ItemEntity {
  PK: string;
  SK?: string;
  ResourceType: string;
}

export class ItemEntityClass implements ItemEntity {
  ResourceType: string;
  PK: string;
  SK?: string;
}

type GetItemArgs = {
  table: string;
  key: [string, string?];
  consistent?: boolean;
};

export async function getItem<T extends ItemEntity>(input: GetItemArgs): Promise<T | null> {
  const item = await client.send(
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

type PutItemArgs<T extends ItemEntity> = {
  table: string;
  overwrite?: boolean;
  data: T;
};

export async function putItem<T extends ItemEntity>(input: PutItemArgs<T>): Promise<PutItemCommandOutput> {
  return await client.send(
    new PutItemCommand({
      TableName: input.table,
      Item: marshall(input.data),
      ConditionExpression: input.overwrite ? undefined : "attribute_not_exists(pk)",
    })
  );
}

type DeleteItemArgs = {
  table: string;
  key: [string, string?];
};

export async function deleteItem<T extends ItemEntity>(input: DeleteItemArgs): Promise<T | null> {
  const item = await client.send(
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

type QueryItemArgs = {
  table: string;
  index?: GSI;
  keyCondition: string;
  filterExpression?: string;
  expressionNames: { [key: string]: string };
  expressionValues: { [key: string]: string | number };
};

export async function* queryItems<T extends ItemEntity>(input: QueryItemArgs): AsyncGenerator<T> {
  const paginator = paginateQuery(
    { client },
    {
      TableName: input.table,
      IndexName: input.index,
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

type PutVersionTransactionArgs<T> = {
  table: string;
  lastVersion: string;
  nextVersion: string;
  item: T;
};

interface ProvenancedDataItem extends ItemEntity {
  CreatedAt: number;
  CreatedBy: string;
  Data: Record<string, any>;
}

export async function putVersioned<T extends ProvenancedDataItem>(input: PutVersionTransactionArgs<T>) {
  return client.send(
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
