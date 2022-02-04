import { Module } from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import { DynamodbModule } from "../dynamodb/dynamodb.module";
import { MetadataController } from "./metadata.controller";
import { FormService } from "./form.service";
import { AuthorizationService } from "./authorization.service";
import { RelationshipsService } from "./relationships.service";

@Module({
  providers: [MetadataService, FormService, AuthorizationService, RelationshipsService],
  exports: [MetadataService, FormService],
  imports: [DynamodbModule],
  controllers: [MetadataController],
})
export class MetadataModule {}
