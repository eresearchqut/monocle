import { Module } from "@nestjs/common";
import { DynamodbService } from "./dynamodb.service";
import { DynamoDbClientProvider } from "./dynamodb.client";

@Module({
  providers: [DynamodbService, DynamoDbClientProvider],
  exports: [DynamodbService, DynamoDbClientProvider],
})
export class DynamodbModule {}
