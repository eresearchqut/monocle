import { Module } from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import { DynamodbModule } from "../dynamodb/dynamodb.module";
import { MetadataController } from "./metadata.controller";
import { FormService } from "../form/form.service";
import { AuthorizationService } from "../authorization/authorization.service";
import { RelationshipsService } from "../relationships/relationships.service";

@Module({
  providers: [MetadataService, FormService, AuthorizationService, RelationshipsService],
  exports: [MetadataService, FormService, RelationshipsService],
  imports: [DynamodbModule],
  controllers: [MetadataController],
})
export class MetadataModule {}
