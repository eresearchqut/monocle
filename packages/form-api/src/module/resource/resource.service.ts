import { Injectable } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { MetadataService } from "../metadata/metadata.service";
import { DynamodbService } from "../dynamodb/dynamodb.service";
import { ValidationException } from "../metadata/metadata.exception";
import { ItemEntity } from "../dynamodb/dynamodb.entity";

interface GetResourceInput {
  resource: string;
  id: string;
  options?: any;
}

interface DeleteResourceInput {
  resource: string;
  id: string;
  options?: any;
}

interface PutResourceInput {
  resource: string;
  id?: string;
  version?: string;
  data: any;
  options?: any;
}

@Injectable()
export class ResourceService {
  constructor(
    private configService: ConfigService<AppConfig, true>,
    private metadataService: MetadataService,
    private dynamodbService: DynamodbService
  ) {}

  public async getResource(input: GetResourceInput): Promise<ItemEntity | null> {
    const { getDataKey, getGroupMetadata } = await this.metadataService.getMetadata(input.resource);
    const key = getDataKey(input.id);

    const item = await this.dynamodbService.getItem({ table: this.configService.get("RESOURCE_TABLE"), ...key });

    if (this.configService.get("VALIDATE_RESOURCE_ON_READ")) {
      const { formVersion } = getGroupMetadata();
      const { validate } = await this.metadataService.getForm(formVersion);
      validate(item);
    }

    // TODO: run authorization policy check

    return item;
  }

  public async putResource(input: PutResourceInput): Promise<any> {
    const { createDataKey, getDataKey, getGroupMetadata } = await this.metadataService.getMetadata(
      input.resource,
      input.version
    );
    const { id, key } = input.id ? { id: input.id, key: getDataKey(input.id) } : createDataKey();

    if (this.configService.get("VALIDATE_RESOURCE_ON_WRITE")) {
      const { formVersion } = getGroupMetadata();
      const { validate } = await this.metadataService.getForm(formVersion);
      const errors = validate(input.data);
      if (errors) {
        throw new ValidationException(errors);
      }
    }

    const data = {
      ...key,
      Id: id,
      ItemType: input.resource,
      CreatedAt: new Date().toISOString(),
      CreatedBy: "admin",
      Data: input.data,
    };

    // TODO: run authorization policy check

    await this.dynamodbService.putItem({
      table: this.configService.get("RESOURCE_TABLE"),
      item: data,
    });

    return data;
  }

  public async deleteResource(input: DeleteResourceInput): Promise<any> {
    const { getDataKey } = await this.metadataService.getMetadata(input.resource);
    const key = getDataKey(input.id);

    // TODO: run authorization policy check

    return await this.dynamodbService.deleteItem({ table: this.configService.get("RESOURCE_TABLE"), ...key });
  }
}
