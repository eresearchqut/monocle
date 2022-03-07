import { Injectable } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { MetadataService } from "../meta/metadata/metadata.service";
import { DynamodbService } from "../dynamodb/dynamodb.service";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import { FormService } from "../meta/form/form.service";
import { ProjectionsService } from "../meta/projections/projections.service";
import { ValidationException } from "./resource.exception";
import { SYSTEM_USER } from "../meta/constants";

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

interface QueryResourceProjectionInput {
  projection: string;
  resource: string;
  reverse: boolean;
  query?: string | number | boolean;
  version?: string;
}

interface QueryRelatedResourceInput {
  projection: string;
  resource: string;
  id: string;
  targetResource: string;
  version?: string;
}

const LOCK_TTL_DELTA = 60;
const LOCK_RETRY_DELAY = 2000;

@Injectable()
export class ResourceService {
  constructor(
    private configService: ConfigService<AppConfig, true>,
    private metadataService: MetadataService,
    private formService: FormService,
    private projectionsService: ProjectionsService,
    private dynamodbService: DynamodbService
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

  private async acquireLock(table: string, partitionKey: string) {
    let lockCreated = false;
    while (!lockCreated) {
      lockCreated = await this.dynamodbService
        .createItem({
          table,
          item: {
            PK: partitionKey,
            SK: "Lock",
            CreatedAt: new Date().toISOString(),
            CreatedBy: SYSTEM_USER,
            Id: "Lock",
            ItemType: "Lock",
            TTL: Math.floor(Date.now() / 1000) + LOCK_TTL_DELTA,
            Data: {},
          },
        })
        .then(() => true)
        .catch(async (err) => {
          if (err.code === "ConditionalCheckFailed") {
            await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_DELAY));
            return false;
          } else {
            return Promise.reject(err);
          }
        });
    }
  }

  private async releaseLock(table: string, partitionKey: string) {
    await this.dynamodbService.deleteItem({
      table,
      PK: partitionKey,
      SK: "Lock",
    });
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

    const {
      requiresLock,
      buildProjectionsIndexKeys,
      buildProjectionsCompositeItems,
      buildProjectionOldCompositeAttributes,
    } = await this.projectionsService.getProjections(Schemas.projectionsVersion);

    const projectionKeys = buildProjectionsIndexKeys(Resource, attrs.Id, input.data);

    const data = {
      ...attrs,
      ...projectionKeys,
      Data: input.data,
    };

    const { transaction: transactionItems, lock: lockItems } = buildProjectionsCompositeItems(
      Resource,
      attrs.Id,
      input.data
    );

    // TODO: run authorization policy check

    const table = this.configService.get("RESOURCE_TABLE");

    if (input.id) {
      const useLock = requiresLock();
      if (useLock) {
        await this.acquireLock(table, attrs.PK);
      }

      try {
        const oldItem = await this.dynamodbService.getItem({
          table,
          PK: attrs.PK,
          SK: attrs.SK,
          consistent: true,
        });

        if (oldItem === null) {
          throw new Error("Item didn't already exist");
        }

        const oldRelatedKeys = buildProjectionOldCompositeAttributes(Resource, attrs.Id, oldItem.Data, input.data);

        if (transactionItems.length + oldRelatedKeys.length > 24) {
          throw new Error("Too many projection operations at once"); // TODO: test
        }

        await Promise.all([
          this.dynamodbService.putItemsTransaction({
            table,
            baseItem: data,
            previousBaseCreatedAt: oldItem.CreatedAt,
            putItems: transactionItems,
            deleteItems: oldRelatedKeys,
          }),
          ...lockItems.map((item) =>
            this.dynamodbService.putItem({
              table,
              item,
              ignoreOld: true,
            })
          ),
        ]); // TODO: handle failure
      } finally {
        if (useLock) {
          await this.releaseLock(table, attrs.PK);
        }
      }
    } else {
      const projectionItems = transactionItems.concat(lockItems);
      const [oldItem] = await Promise.all([
        this.dynamodbService.putItem({
          table,
          item: data,
          ignoreOld: input.id === undefined,
        }),
        ...projectionItems.map((item) =>
          this.dynamodbService.putItem({
            table,
            item,
            ignoreOld: true,
          })
        ),
      ]);

      if (oldItem !== null) {
        throw new Error("Item already existed");
      }
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

    const { buildProjectionsCompositeAttributes } = await this.projectionsService.getProjections(
      Schemas.projectionsVersion
    );

    // TODO: run authorization policy check

    const table = this.configService.get("RESOURCE_TABLE");

    const item = await this.dynamodbService.deleteItem({ table, ...key });

    const toDelete = buildProjectionsCompositeAttributes(Resource, input.id, item.Data);

    await Promise.all(
      toDelete.map((key) =>
        this.dynamodbService.deleteItem({
          table,
          ...key,
        })
      )
    );

    // TODO: optionally return all deleted projection items as well
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

  public async *queryResourceProjection(input: QueryResourceProjectionInput) {
    const {
      Data: {
        Schemas: { projectionsVersion },
        Resource,
      },
    } = await this.metadataService.getMetadata(input.resource);
    const { buildPrimitiveProjectionQuery } = await this.projectionsService.getProjections(projectionsVersion);

    // TODO: run authorization policy check

    yield* this.dynamodbService.queryItems({
      table: this.configService.get("RESOURCE_TABLE"),
      ...buildPrimitiveProjectionQuery(input.projection, Resource, input.reverse, input.query),
    });
  }

  public async *queryRelatedResources(input: QueryRelatedResourceInput) {
    const {
      Data: {
        Schemas: { projectionsVersion },
      },
    } = await this.metadataService.getMetadata(input.targetResource); // TODO: consider including resource semver in projections
    const { buildRelatedQuery } = await this.projectionsService.getProjections(projectionsVersion);

    // TODO: run authorization policy check

    yield* this.dynamodbService.queryItems({
      table: this.configService.get("RESOURCE_TABLE"),
      ...buildRelatedQuery(input.projection, input.id),
    });
  }
}
