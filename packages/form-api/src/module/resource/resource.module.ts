import { Module } from "@nestjs/common";
import { ResourceController } from "./resource.controller";
import { ResourceService } from "./resource.service";
import { MetadataModule } from "../metadata/metadata.module";
import { DynamodbModule } from "../dynamodb/dynamodb.module";

@Module({
  controllers: [ResourceController],
  providers: [ResourceService],
  imports: [MetadataModule, DynamodbModule],
})
export class ResourceModule {}
