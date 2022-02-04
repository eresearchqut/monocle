import { Injectable } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { MetadataService } from "../metadata/metadata.service";
import { DynamodbRepository } from "../dynamodb/dynamodb.repository";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import { FormService } from "../metadata/form.service";
import { RelationshipsService } from "../metadata/relationships.service";
import { RELATIONSHIP_TYPES } from "../metadata/relationships.entity";
import { RelationshipException, ValidationException } from "./resource.exception";
import { Metadata } from "../metadata/metadata.entity";

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

    const { buildRelationshipIndexKeys } = await this.relationshipsService.getRelationships(
      Schemas.RelationshipsVersion
    );

    const relationshipKeys = buildRelationshipIndexKeys(
      this.metadataService.buildResourceIdentifier(Resource, attrs.Id),
      input.data
    );

    const data = {
      ...attrs,
      ...relationshipKeys,
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

  public async *queryRelatedResources(input: QueryResourceInput) {
    const {
      Data: {
        Resource,
        Schemas: { RelationshipsVersion },
      },
    } = await this.metadataService.getMetadata(input.targetResource); // TODO: consider including resource semver in relationships
    const {
      Data: { Relationships },
    } = await this.relationshipsService.getRelationships(RelationshipsVersion);

    // TODO: make relationships bi-directional
    // TODO: support querying composite relationships
    // TODO: allow resources to have multiple relationships between each other
    const index = Relationships.filter((relationship) => relationship.Type === RELATIONSHIP_TYPES.INDEX).findIndex(
      (relationship) => relationship.Resource === Resource
    );

    if (index === undefined) {
      throw new RelationshipException("Invalid relationship"); // TODO: consider removing message to not leak relationships
    }

    yield* this.dynamodbService.queryItems({
      table: this.configService.get("RESOURCE_TABLE"),
      index: `GSI-${index}`,
      keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
      expressionNames: {
        "#PK": "PK",
        "#SK": "SK",
      },
      expressionValues: {
        ":PK": this.metadataService.buildResourceIdentifier(Resource, input.id),
        ":SKPrefix": this.relationshipsService.buildResourcePrefix(input.targetResource), // TODO: use validated target
      },
    });
  }
}
