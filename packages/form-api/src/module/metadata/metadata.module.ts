import { Module } from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import { DynamodbModule } from "../dynamodb/dynamodb.module";
import { MetadataController } from "./metadata.controller";

@Module({
  providers: [MetadataService],
  exports: [MetadataService],
  imports: [DynamodbModule],
  controllers: [MetadataController],
})
export class MetadataModule {}
