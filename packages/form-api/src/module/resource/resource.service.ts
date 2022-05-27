import { Injectable } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { MetadataService } from "../meta/metadata/metadata.service";
import { DynamodbService } from "../dynamodb/dynamodb.service";
import { ItemEntity, VersionedItemEntity } from "../dynamodb/dynamodb.entity";
import { FormService } from "../meta/form/form.service";
import { RelationshipsService } from "../meta/relationships/relationships.service";
import { ValidationException } from "./resource.exception";
import { from as ixSyncFrom } from "ix/iterable";
import { from as ixAsyncFrom } from "ix/asynciterable";
import { bufferCountOrTime } from "ix/asynciterable/operators/buffercountortime";
import { buffer } from "ix/iterable/operators/buffer";
import { match } from "ts-pattern";

const TRANSACTION_MAX_PUT_ITEMS = 24;
const BULK_MAX_DELETE_ITEMS = 25;
const BULK_MAX_DELETE_MIN_DELAY = 1000;

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
  resource: {
    name: string;
    version?: string;
  };
  id?: string;
  version?: number;
  data: any;
  options?: any;
}

interface QueryResourceInput {
  resource: string;
  version?: string;
}

type QueryRelatedResourceInput = {
  relationship: string;
  resource: string;
  id: string;
  version?: string;
} & ({ direction: "sourceToTarget" } | { direction: "targetToSource"; targetResource: string });

@Injectable()
export class ResourceService {
  constructor(
    private configService: ConfigService<AppConfig, true>,
    private metadataService: MetadataService,
    private formService: FormService,
    private relationshipsService: RelationshipsService,
    private dynamodbService: DynamodbService
  ) {}

  public async getResource(input: GetResourceInput): Promise<VersionedItemEntity | null> {
    const {
      buildGetAttributes,
      Data: { Schemas },
    } = await this.metadataService.getMetadata(input.resource);
    const key = buildGetAttributes(input.id);

    const item = await this.dynamodbService.getItem<VersionedItemEntity>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });

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
    } = await this.metadataService.getMetadata(input.resource.name, input.resource.version);

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

    const { buildRelationshipsCompositeItems, buildDeletionQuery } = await this.relationshipsService.getRelationships(
      Schemas.RelationshipsVersion
    );

    const data = {
      ...attrs,
      Data: input.data,
    };

    const lastVersion = input.version ?? 0;
    const thisVersion = lastVersion + 1;

    const transactionItems = buildRelationshipsCompositeItems(Resource, Version, attrs.Id, input.data, thisVersion);

    // TODO: run authorization policy check

    const table = this.configService.get("RESOURCE_TABLE");

    const putItem = await this.dynamodbService.putVersionedItem({
      table,
      item: data,
      lastVersion,
    });

    if (!putItem.created) {
      if (input.id) {
        throw new Error(`Item with version ${input.version} already existed`);
      } else {
        throw new Error("Item didn't already exist");
      }
    }

    // Not using Promise.all because many concurrent transactions can cause conflicts when item is deleted
    // while transactions are still running, and to stop PUTing more items after a resource has been deleted
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html#transaction-best-practices
    // TODO: handle transaction exception then continue deleting
    for (const transactionBatch of ixSyncFrom(transactionItems).pipe(buffer(TRANSACTION_MAX_PUT_ITEMS))) {
      await this.dynamodbService.putItemsTransaction({
        table,
        key: {
          PK: attrs.PK,
          SK: attrs.SK,
        },
        version: thisVersion,
        putItems: transactionBatch,
      });
    }

    await this.deleteRelated(
      table,
      this.dynamodbService.queryItems({
        table,
        ...buildDeletionQuery(Resource, attrs.Id, lastVersion),
      })
    );

    // TODO: optionally return old data
    return data;
  }

  private deleteRelated = (table: string, items: AsyncGenerator<ItemEntity>) =>
    ixAsyncFrom(items)
      .pipe(bufferCountOrTime(BULK_MAX_DELETE_ITEMS, BULK_MAX_DELETE_MIN_DELAY))
      .forEach(async (items) => {
        await this.dynamodbService
          .bulkDeleteItems({
            table,
            items,
          })
          .then((remaining) => {
            if (remaining.length > 0) {
              throw new Error(`Failed to delete ${remaining.length} items`);
            }
          });
      });

  public async deleteResource(input: DeleteResourceInput): Promise<any> {
    const {
      Data: { Resource, Schemas },
      buildGetAttributes,
    } = await this.metadataService.getMetadata(input.resource);
    const key = buildGetAttributes(input.id);

    const { buildDeletionQuery } = await this.relationshipsService.getRelationships(Schemas.RelationshipsVersion);

    // TODO: run authorization policy check

    const table = this.configService.get("RESOURCE_TABLE");

    const item = await this.dynamodbService.deleteItem<VersionedItemEntity>({ table, ...key });

    await this.deleteRelated(
      table,
      this.dynamodbService.queryItems({
        table,
        ...buildDeletionQuery(Resource, input.id, item.Version),
      })
    );

    // TODO: optionally return all deleted relationship items as well
    return item.Data;
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
    // TODO: refactor to use private method?
    const resource = match(input)
      .with({ direction: "sourceToTarget" }, (i) => i.resource)
      .with({ direction: "targetToSource" }, (i) => i.targetResource)
      .exhaustive();
    const {
      Data: {
        Schemas: { RelationshipsVersion },
      },
    } = await this.metadataService.getMetadata(resource);

    const { buildSourceToTargetQuery, buildTargetToSourceQuery } = await this.relationshipsService.getRelationships(
      RelationshipsVersion
    );

    const query = await match(input)
      .with({ direction: "sourceToTarget" }, async () => {
        // TODO: get version from input
        const sourceItem = await this.getResource({ resource: input.resource, id: input.id });
        if (sourceItem === null) {
          throw new Error("Failed retrieving source item");
        }
        return buildSourceToTargetQuery(input.resource, input.id, sourceItem.Version, input.relationship);
      })
      .with({ direction: "targetToSource" }, async () => buildTargetToSourceQuery(input.relationship, input.id))
      .exhaustive();

    // TODO: run authorization policy check

    const items = this.dynamodbService.queryItems({
      table: this.configService.get("RESOURCE_TABLE"),
      ...query,
    });

    // Deduplicate related items from partially-deleted relationships from previous resource version
    const prev = { PK: "", SK: "" };
    for await (const item of items) {
      if (item.PK !== prev.PK || item.SK !== prev.SK) {
        yield item;
        prev.PK = item.PK;
        prev.SK = item.SK;
      }
    }
  }
}
