import { Injectable } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { MetadataService } from "../meta/metadata/metadata.service";
import { DynamodbRepository } from "../dynamodb/dynamodb.repository";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import { FormService } from "../meta/form/form.service";
import { ProjectionsService } from "../meta/projections/projections.service";
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
  version?: string;
}

interface QueryRelatedResourceInput {
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
    private relationshipsService: ProjectionsService,
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

    const { buildRelationshipsIndexKeys, buildRelationshipsCompositeItems, buildRelationshipOldCompositeAttributes } =
      await this.relationshipsService.getProjections(Schemas.RelationshipsVersion);

    const relationshipKeys = buildRelationshipsIndexKeys(Resource, attrs.Id, input.data);

    const data = {
      ...attrs,
      ...relationshipKeys,
      Data: input.data,
    };

    const relatedItems = buildRelationshipsCompositeItems(Resource, attrs.Id, input.data);

    // TODO: run authorization policy check

    const table = this.configService.get("RESOURCE_TABLE");
    const [oldItem] = await Promise.all([
      this.dynamodbService.putItem({
        table,
        item: data,
        ignoreOld: input.id === undefined,
      }),
      ...relatedItems.map((r) =>
        this.dynamodbService.putItem({
          table,
          item: r,
          ignoreOld: true,
        })
      ),
    ]);

    if (input.id) {
      if (oldItem === null) {
        throw Error("Item didn't already exist");
      }

      const oldRelatedKeys = buildRelationshipOldCompositeAttributes(Resource, attrs.Id, oldItem.Data, input.data);

      await Promise.all(oldRelatedKeys.map((keys) => this.dynamodbService.deleteItem({ table, ...keys })));
    }

    // TODO: optionally return old data
    return data;
  }

  public async deleteResource(input: DeleteResourceInput): Promise<any> {
    const {
      Data: { Resource, Schemas },
      buildGetAttributes,
    } = await this.metadataService.getMetadata(input.resource);
    const key = buildGetAttributes(input.id);

    const { buildRelationshipsCompositeAttributes } = await this.relationshipsService.getProjections(
      Schemas.RelationshipsVersion
    );

    // TODO: run authorization policy check

    const table = this.configService.get("RESOURCE_TABLE");

    const item = await this.dynamodbService.deleteItem({ table, ...key });

    const toDelete = buildRelationshipsCompositeAttributes(Resource, input.id, item.Data);

    await Promise.all(
      toDelete.map((key) =>
        this.dynamodbService.deleteItem({
          table,
          ...key,
        })
      )
    );

    // TODO: optionally return all deleted relationship items as well
    return item;
  }

  public async *queryResources(input: QueryResourceInput) {
    const { buildQuery } = await this.metadataService.getMetadata(input.resource);

    // TODO: run authorization policy check

    yield* this.dynamodbService.queryItems({
      table: this.configService.get("RESOURCE_TABLE"),
      ...buildQuery(),
    });
  }

  public async *queryRelatedResources(input: QueryRelatedResourceInput) {
    const {
      Data: {
        Schemas: { RelationshipsVersion },
      },
    } = await this.metadataService.getMetadata(input.targetResource); // TODO: consider including resource semver in projections
    const { buildQuery } = await this.relationshipsService.getProjections(RelationshipsVersion);

    // TODO: run authorization policy check

    yield* this.dynamodbService.queryItems({
      table: this.configService.get("RESOURCE_TABLE"),
      ...buildQuery(input.relationshipName, input.id),
    });
  }
}
