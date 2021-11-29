import { Injectable } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { MetadataService } from "../metadata/metadata.service";
import { DynamodbService } from "../dynamodb/dynamodb.service";

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

  public async getResource(input: GetResourceInput): Promise<any> {
    const { getDataKey, getGroupMetadata } = await this.metadataService.getMetadata(input.resource);
    const key = getDataKey(input.id);

    const item = await this.dynamodbService.getItem({ table: this.configService.get("RESOURCE_TABLE"), key });

    if (this.configService.get("VALIDATE_RESOURCE_ON_READ")) {
      const { formVersion } = getGroupMetadata();
      const { validate } = await this.metadataService.getForm(formVersion);
      validate(item);
    }

    return item;
  }

  public async putResource(input: PutResourceInput): Promise<any> {
    const { createDataKey, getDataKey, getGroupMetadata } = await this.metadataService.getMetadata(
      input.resource,
      input.version
    );
    const resourceKey = input.id ? getDataKey(input.id) : createDataKey();

    const data = {
      ...input.data,
      PK: resourceKey[0],
      SK: resourceKey[1],
      ResourceType: input.resource,
    };

    if (this.configService.get("VALIDATE_RESOURCE_ON_WRITE")) {
      const { formVersion } = getGroupMetadata();
      const { validate } = await this.metadataService.getForm(formVersion);
      validate(data);
    }

    return await this.dynamodbService.putItem({ table: this.configService.get("RESOURCE_TABLE"), data });
  }

  public async deleteResource(input: DeleteResourceInput): Promise<any> {
    const { getDataKey } = await this.metadataService.getMetadata(input.resource);
    const key = getDataKey(input.id);

    return await this.dynamodbService.deleteItem({ table: this.configService.get("RESOURCE_TABLE"), key });
  }
}
