import { Module } from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import { DynamodbModule } from "../dynamodb/dynamodb.module";

@Module({
  providers: [MetadataService],
  exports: [MetadataService],
  imports: [DynamodbModule],
})
export class MetadataModule {}
