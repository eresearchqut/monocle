import { Module } from "@nestjs/common";
import { ResourceController } from "./resource.controller";
import { ResourceService } from "./resource.service";
import { MetadataModule } from "../meta/metadata/metadata.module";
import { DynamodbModule } from "../dynamodb/dynamodb.module";
import { FormModule } from "../meta/form/form.module";
import { RelationshipsModule } from "../meta/relationships/relationships.module";
import { ConstraintsModule } from "../meta/constraints/constraints.module";

@Module({
  controllers: [ResourceController],
  providers: [ResourceService],
  imports: [MetadataModule, FormModule, RelationshipsModule, ConstraintsModule, DynamodbModule],
})
export class ResourceModule {}
