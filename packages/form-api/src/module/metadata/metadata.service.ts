import { Injectable } from "@nestjs/common";
import { TransformPlainToClass } from "class-transformer";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "src/app.config";
import { MetadataException } from "./metadata.exception";
import { ConditionallyValidateClass } from "src/decorator/validate.decorator";
import { DynamodbService } from "../dynamodb/dynamodb.service";
import { Metadata, MetadataAuthorization, MetadataForm } from "./metadata.entity";

function metadataKey(resource: string, version: string) {
  return `Resource:${resource}#metadata:v${version}`;
}

@Injectable()
export class MetadataService {
  constructor(private configService: ConfigService<AppConfig, true>, private dynamodbService: DynamodbService) {}

  @TransformPlainToClass(Metadata)
  @ConditionallyValidateClass("VALIDATE_METADATA_ON_READ")
  public async getMetadata(resource: string, version = "0.0.0"): Promise<Metadata> {
    const key = metadataKey(resource, version);
    const item = await this.dynamodbService.getItem<Metadata>({
      table: this.configService.get("RESOURCE_TABLE"),
      key: [key, key],
    });
    if (item === null) {
      throw new MetadataException(`Failed to retrieve metadata for resource ${resource} v${version}`);
    }
    return item;
  }

  public async putMetadata(resource: string, version: string, metadata: Metadata): Promise<void> {
    const key = metadataKey(resource, version);
    const data = {
      ...metadata,
      PK: key[0],
      SK: key[1],
    };
    await this.dynamodbService.putItem({
      table: this.configService.get("RESOURCE_TABLE"),
      data,
    });
  }

  @TransformPlainToClass(MetadataForm)
  @ConditionallyValidateClass("VALIDATE_METADATA_ON_READ")
  public async getForm(form: string): Promise<MetadataForm> {
    const key = `Form:${form}`;
    const item = await this.dynamodbService.getItem<MetadataForm>({
      table: this.configService.get("RESOURCE_TABLE"),
      key: [key, key],
    });
    if (item === null) {
      throw new MetadataException(`Failed to retrieve form ${form}`);
    }
    return item;
  }

  @TransformPlainToClass(MetadataAuthorization)
  @ConditionallyValidateClass("VALIDATE_METADATA_ON_READ")
  public async getAuthorization(policy: string): Promise<MetadataAuthorization> {
    const key = `Policy:${policy}`;
    const item = await this.dynamodbService.getItem<MetadataAuthorization>({
      table: this.configService.get("RESOURCE_TABLE"),
      key: [key, key],
    });
    if (item === null) {
      throw new MetadataException(`Failed to retrieve authorization policy for resource ${policy}`);
    }
    return item;
  }
}
