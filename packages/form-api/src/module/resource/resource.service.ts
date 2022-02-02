import { Injectable } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { MetadataService } from "../metadata/metadata.service";
import { DynamodbRepository } from "../dynamodb/dynamodb.repository";
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
    private dynamodbService: DynamodbRepository
  ) {}

  public async getResource(input: GetResourceInput): Promise<ItemEntity | null> {
    const {
      buildGetAttributes,
      Data: { Schemas },
    } = await this.metadataService.getMetadata(input.resource);
    const key = buildGetAttributes(input.id);

    const item = await this.dynamodbService.getItem({ table: this.configService.get("RESOURCE_TABLE"), ...key });

    if (this.configService.get("VALIDATE_RESOURCE_ON_READ")) {
      const { validate } = await this.metadataService.getForm(Schemas.FormVersion);
      validate(item);
    }

    // TODO: run authorization policy check

    return item;
  }

  public async putResource(input: PutResourceInput): Promise<any> {
    const {
      buildPutAttributes,
      Data: { Resource, Version, Schemas },
    } = await this.metadataService.getMetadata(input.resource, input.version);

    const attrs = buildPutAttributes({
      id: input.id,
      user: "username", // TODO: insert user id
      resource: {
        name: Resource,
        version: Version,
      },
    });

    if (this.configService.get("VALIDATE_RESOURCE_ON_WRITE")) {
      const { validate } = await this.metadataService.getForm(Schemas.FormVersion);
      const errors = validate(input.data);
      if (errors) {
        throw new ValidationException(errors);
      }
    }

    const data = {
      ...attrs,
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
    const { buildGetAttributes } = await this.metadataService.getMetadata(input.resource);
    const key = buildGetAttributes(input.id);

    // TODO: run authorization policy check

    return await this.dynamodbService.deleteItem({ table: this.configService.get("RESOURCE_TABLE"), ...key });
  }
}
