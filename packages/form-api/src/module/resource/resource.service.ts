import { Injectable } from "@nestjs/common";
import { AppConfig } from "../../app.config";
import { ConfigService } from "@nestjs/config";
import { MetadataService } from "../meta/metadata/metadata.service";
import { DynamodbService, PutItemFailReason } from "../dynamodb/dynamodb.service";
import { ItemEntity, VersionedItemEntity } from "../dynamodb/dynamodb.entity";
import { FormService } from "../meta/form/form.service";
import { RelationshipsService } from "../meta/relationships/relationships.service";
import { ConstraintsService } from "../meta/constraints/constraints.service";
import { ConstraintException, PutException, ValidationException } from "./resource.exception";
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
    private constraintsService: ConstraintsService,
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

    const [
      { hasConstraints, buildConstraintsItems, buildConstraintsItemsDiff },
      { buildRelationshipsItems, buildDeletionQuery },
    ] = await Promise.all([
      this.constraintsService.getConstraints(Schemas.ConstraintsVersion),
      this.relationshipsService.getRelationships(Schemas.RelationshipsVersion),
    ]);

    const data = {
      ...attrs,
      Data: input.data,
    };

    const lastVersion = input.version ?? 0;
    const thisVersion = lastVersion + 1;

    const relationshipsItems = buildRelationshipsItems(Resource, Version, attrs.Id, input.data, thisVersion);

    // TODO: run authorization policy check

    const table = this.configService.get("RESOURCE_TABLE");

    let putArgs;
    if (!hasConstraints()) {
      putArgs = {
        table,
        item: data,
        lastVersion,
      };
    } else if (!input.id) {
      putArgs = {
        table,
        item: data,
        lastVersion,
        addedConstraints: buildConstraintsItems(Resource, attrs.Id, input.data, 1), // TODO: handle response for KeyError,
      };
    } else {
      const previous = await this.getResource({
        resource: Resource,
        id: input.id,
      });
      if (previous === null) {
        throw new Error("Cannot put an item that already exists");
      }
      if (previous.Version !== lastVersion) {
        throw new Error("Item has been updated");
      }
      putArgs = {
        table,
        item: data,
        lastVersion,
        ...buildConstraintsItemsDiff(Resource, attrs.Id, previous.Data, input.data, thisVersion),
      };
    }

    match(await this.dynamodbService.putVersionedItemAndConstraints(putArgs))
      .with({ succeeded: true }, () => true)
      .with(
        { succeeded: false, reason: PutItemFailReason.PUT_FAILED_UNKNOWN },
        { succeeded: false, reason: PutItemFailReason.TRANSACTION_CANCELLED_UNKNOWN },
        { succeeded: false, reason: PutItemFailReason.TRANSACTION_FAILED_UNKNOWN },
        (response) => {
          console.error(response.error); // TODO: proper logging
          throw new PutException("Failed to save resource");
        }
      )
      .with({ succeeded: false, reason: PutItemFailReason.TRANSACTION_CONFLICT }, () => {
        throw new PutException("Resource is being updated in another request");
      })
      .with({ succeeded: false, reason: PutItemFailReason.ITEM_ALREADY_EXISTS_AT_VERSION }, () => {
        throw new PutException("Resource's saved version does not match");
      })
      .with(
        {
          succeeded: false,
          reason: PutItemFailReason.CONSTRAINTS_ALREADY_EXIST,
        },
        (response) => {
          throw new ConstraintException(response.existingConstraints);
        }
      )
      .exhaustive();

    // Not using Promise.all because many concurrent transactions can cause conflicts when item is deleted
    // while transactions are still running, and to stop PUTing more items after a resource has been deleted
    // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html#transaction-best-practices

    // TODO: handle transaction exception then stop creating, continue deleting
    // TODO: optionally check that related item exists (requires ConditionCheck that halves the number of operations)
    for (const transactionBatch of ixSyncFrom(relationshipsItems).pipe(buffer(TRANSACTION_MAX_PUT_ITEMS))) {
      await this.dynamodbService.conditionallyPutItemsTransaction({
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

    const [{ hasConstraints, buildConstraintsKeyAttributes }, { buildDeletionQuery }] = await Promise.all([
      this.constraintsService.getConstraints(Schemas.ConstraintsVersion),
      this.relationshipsService.getRelationships(Schemas.RelationshipsVersion),
    ]);

    // TODO: run authorization policy check

    const table = this.configService.get("RESOURCE_TABLE");

    let item;
    if (!hasConstraints()) {
      item = await this.dynamodbService.deleteItem<VersionedItemEntity>({ table, ...key });
    } else {
      item = await this.getResource({
        resource: Resource,
        id: input.id,
      });
      if (item === null) {
        throw new Error("Item does not exist");
      }
      await this.dynamodbService.deleteVersionedItemAndConstraints({
        table,
        key,
        constraints: buildConstraintsKeyAttributes(Resource, input.id, item.Data),
      });
    }

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
