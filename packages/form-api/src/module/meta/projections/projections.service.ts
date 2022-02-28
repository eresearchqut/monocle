import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../../app.config";
import { DynamodbService } from "../../dynamodb/dynamodb.service";
import { NIL as NIL_UUID, v4 as uuidV4 } from "uuid";
import { SYSTEM_USER } from "../constants";
import { ConcreteProjections, MetadataProjections, MetadataProjectionsType } from "./projections.entity";
import { ConditionallyValidateClassAsync } from "../../../decorator/validate.decorator";
import { TransformPlainToClass } from "class-transformer";
import { match } from "ts-pattern";
import { ProjectionsException } from "./projections.exception";
import { PARTITION_TYPES, PROJECTION_TYPES } from "./projections.constants";

type PutProjectionsInput = Map<
  string,
  | {
      key: string;
      resource?: string;
      projectionType: PROJECTION_TYPES.INDEX;
      partitionType: PARTITION_TYPES;
      index: number;
    }
  | {
      key: string;
      resource?: string;
      projectionType: PROJECTION_TYPES.COMPOSITE;
      partitionType: PARTITION_TYPES;
      dataKey: string;
    }
>;

export function buildProjectionsItemKey(id: string) {
  const key = `Projections:${id}`;
  return { PK: key, SK: key };
}

export const EMPTY_PROJECTIONS: MetadataProjectionsType = {
  ...buildProjectionsItemKey(NIL_UUID),
  Id: NIL_UUID,
  ItemType: "Projections",
  CreatedAt: new Date().toISOString(),
  CreatedBy: SYSTEM_USER,
  Data: {
    Projections: new Map<string, ConcreteProjections>(),
  },
} as const;

const validateUniqueIndexes = (projections: PutProjectionsInput) => {
  const indexes = new Set();
  for (const indexProjection of projections.values()) {
    if (indexProjection.projectionType === PROJECTION_TYPES.INDEX) {
      if (indexes.has(indexProjection.index)) {
        throw new ProjectionsException(`Duplicate index ${indexProjection.index}`);
      }
      indexes.add(indexProjection.index);
    }
  }
};

@Injectable()
export class ProjectionsService {
  constructor(public configService: ConfigService<AppConfig, true>, private dynamodbService: DynamodbService) {}

  @ConditionallyValidateClassAsync("VALIDATE_METADATA_ON_READ")
  @TransformPlainToClass(MetadataProjections)
  public async getProjections(id: string): Promise<MetadataProjections> {
    if (id === NIL_UUID) {
      // Must cast to MetadataProjections because transform decorator cannot change method signature
      return EMPTY_PROJECTIONS as MetadataProjections;
    }

    const key = buildProjectionsItemKey(id);

    const item = await this.dynamodbService.getItem<MetadataProjections>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });
    if (item === null) {
      throw new ProjectionsException(`Failed to retrieve projections for resource ${id}`);
    }
    return item;
  }

  public async createProjections(projections: PutProjectionsInput): Promise<{ created: false }>;
  public async createProjections(projections: PutProjectionsInput): Promise<{ created: true; id: string }>;
  public async createProjections(projections: PutProjectionsInput): Promise<{ created: boolean; id?: string }> {
    const id = uuidV4();
    const key = buildProjectionsItemKey(id);

    validateUniqueIndexes(projections);

    return this.dynamodbService
      .createItem<MetadataProjectionsType>({
        table: this.configService.get("RESOURCE_TABLE"),
        item: {
          ...key,
          Id: id,
          ItemType: "Projections",
          CreatedAt: new Date().toISOString(),
          CreatedBy: SYSTEM_USER,
          Data: {
            Projections: new Map(
              Array.from(projections).map(([name, projection]) => [
                name,
                match(projection)
                  .with({ projectionType: PROJECTION_TYPES.INDEX }, (r) => ({
                    Key: r.key,
                    ...(r.resource !== undefined && { Resource: r.resource }),
                    PartitionType: r.partitionType,
                    ProjectionType: r.projectionType,
                    Index: r.index,
                  }))
                  .with({ projectionType: PROJECTION_TYPES.COMPOSITE }, (r) => ({
                    Key: r.key,
                    ...(r.resource !== undefined && { Resource: r.resource }),
                    PartitionType: r.partitionType,
                    ProjectionType: r.projectionType,
                    DataKey: r.dataKey,
                  }))
                  .exhaustive(),
              ])
            ),
          },
        },
      })
      .then(() => ({ created: true, id }))
      .catch((err) => (err.code === "ConditionalCheckFailed" ? { created: false } : Promise.reject(err)));
  }
}
