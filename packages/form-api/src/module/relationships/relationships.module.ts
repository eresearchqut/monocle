import { Module } from "@nestjs/common";
import { RelationshipsService } from "./relationships.service";
import { RelationshipsController } from "./relationships.controller";
import { DynamodbModule } from "../dynamodb/dynamodb.module";

@Module({
  providers: [RelationshipsService],
  exports: [RelationshipsService],
  imports: [DynamodbModule],
  controllers: [RelationshipsController],
})
export class RelationshipsModule {}
