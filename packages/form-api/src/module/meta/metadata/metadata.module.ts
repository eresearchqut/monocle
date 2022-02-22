import { Module } from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import { DynamodbModule } from "../../dynamodb/dynamodb.module";
import { MetadataController } from "./metadata.controller";
import { AuthorizationService } from "../authorization/authorization.service";
import { FormModule } from "../form/form.module";
import { ProjectionsModule } from "../projections/projections.module";

@Module({
  providers: [MetadataService, AuthorizationService],
  exports: [MetadataService],
  imports: [DynamodbModule, FormModule, ProjectionsModule],
  controllers: [MetadataController],
})
export class MetadataModule {}
