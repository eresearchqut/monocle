import { Module } from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import { DynamodbModule } from "../../dynamodb/dynamodb.module";
import { MetadataController } from "./metadata.controller";
import { AuthorizationService } from "../authorization/authorization.service";
import { FormModule } from "../form/form.module";
import { RelationshipsModule } from "../relationships/relationships.module";

@Module({
  providers: [MetadataService, AuthorizationService],
  exports: [MetadataService],
  imports: [DynamodbModule, FormModule, RelationshipsModule],
  controllers: [MetadataController],
})
export class MetadataModule {}
