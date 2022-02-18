import { Module } from "@nestjs/common";
import { ResourceController } from "./resource.controller";
import { ResourceService } from "./resource.service";
import { MetadataModule } from "../metadata/metadata.module";
import { DynamodbModule } from "../dynamodb/dynamodb.module";
import { FormModule } from "../form/form.module";
import { RelationshipsModule } from "../relationships/relationships.module";

@Module({
  controllers: [ResourceController],
  providers: [ResourceService],
  imports: [MetadataModule, FormModule, RelationshipsModule, DynamodbModule],
})
export class ResourceModule {}
