import { DynamodbService } from "./dynamodb.service";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { ItemEntity } from "./dynamodb.entity";
import { marshall } from "@aws-sdk/util-dynamodb";

// https://aws.amazon.com/blogs/developer/mocking-modular-aws-sdk-for-javascript-v3-in-unit-tests/

describe("DynamodbService", () => {
  let dynamodbService: DynamodbService;
  let configService: ConfigService<AppConfig, true>;
  const ddbMock = mockClient(DynamoDBClient);

  beforeEach(() => {
    configService = new ConfigService(AppConfig);
    dynamodbService = new DynamodbService(configService);
    ddbMock.reset();
  });

  describe("putItem", () => {
    it("should return the old input data", async () => {
      const item: ItemEntity = {
        Id: "1",
        ItemType: "MockItem",
        CreatedAt: new Date().toISOString(),
        CreatedBy: "test",
        Data: {
          test: "test",
        },
        PK: "MockItem:1",
        SK: "MockItem:1",
      };

      ddbMock.on(PutItemCommand).resolves({ Attributes: undefined });

      expect(
        await dynamodbService.putItem({
          table: "MockItem",
          item: item,
        })
      ).toEqual(null);

      ddbMock.on(PutItemCommand).resolves({ Attributes: marshall(item) });

      expect(
        await dynamodbService.putItem({
          table: "MockItem",
          item: item,
        })
      ).toEqual(item);
    });
  });
});
