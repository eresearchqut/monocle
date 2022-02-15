import { Injectable } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { MetadataService } from "../metadata/metadata.service";
import { DynamodbRepository } from "../dynamodb/dynamodb.repository";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import { FormService } from "../metadata/form.service";
import { RelationshipsService } from "../metadata/relationships.service";
import { ValidationException } from "./resource.exception";

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

interface QueryResourceInput {
  resource: string;
  id: string;
  version?: string;
  targetResource: string;
  relationshipName: string;
}

@Injectable()
export class ResourceService {
  constructor(
    private configService: ConfigService<AppConfig, true>,
    private metadataService: MetadataService,
    private formService: FormService,
    private relationshipsService: RelationshipsService,
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
      const { validate } = await this.formService.getForm(Schemas.FormVersion);
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

    if (this.configService.get("VALIDATE_RESOURCE_ON_WRITE")) {
      const { validate } = await this.formService.getForm(Schemas.FormVersion);
      const errors = validate(input.data);
      if (errors) {
        throw new ValidationException(errors);
      }
    }

    const attrs = buildPutAttributes({
      id: input.id,
      user: "username", // TODO: insert user id
      resource: {
        name: Resource,
        version: Version,
      },
    });

    const { buildRelationshipIndexKeys, buildRelationshipCompositeItems } =
      await this.relationshipsService.getRelationships(Schemas.RelationshipsVersion);

    const relationshipKeys = buildRelationshipIndexKeys(Resource, attrs.Id, input.data);

    const data = {
      ...attrs,
      ...relationshipKeys,
      Data: input.data,
    };

    const relatedItems = buildRelationshipCompositeItems(Resource, attrs.Id, input.data);

    // TODO: run authorization policy check

    const table = this.configService.get("RESOURCE_TABLE");
    await Promise.all([
      this.dynamodbService.putItem({
        table,
        item: data,
      }),
      ...relatedItems.map((r) =>
        this.dynamodbService.putItem({
          table,
          item: r,
        })
      ),
    ]);

    return data;
  }

  public async deleteResource(input: DeleteResourceInput): Promise<any> {
    const { buildGetAttributes } = await this.metadataService.getMetadata(input.resource);
    const key = buildGetAttributes(input.id);

    // TODO: run authorization policy check

    return await this.dynamodbService.deleteItem({ table: this.configService.get("RESOURCE_TABLE"), ...key });
  }

  public async *queryRelatedResources(input: QueryResourceInput) {
    const {
      Data: {
        Schemas: { RelationshipsVersion },
      },
    } = await this.metadataService.getMetadata(input.targetResource); // TODO: consider including resource semver in relationships
    const { buildQuery } = await this.relationshipsService.getRelationships(RelationshipsVersion);

    yield* this.dynamodbService.queryItems({
      table: this.configService.get("RESOURCE_TABLE"),
      ...buildQuery(input.relationshipName, input.id),
    });
  }
}
