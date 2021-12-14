import { Module } from "@nestjs/common";
import { DynamodbRepository } from "./dynamodb.repository";
import { DynamoDbClientProvider } from "./dynamodb.client";

@Module({
  providers: [DynamodbRepository, DynamoDbClientProvider],
  exports: [DynamodbRepository, DynamoDbClientProvider],
})
export class DynamodbModule {}
