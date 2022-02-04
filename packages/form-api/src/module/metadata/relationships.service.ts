import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../app.config";
import { DynamodbRepository } from "../dynamodb/dynamodb.repository";
import { NIL as NIL_UUID, v4 as uuidV4 } from "uuid";
import { SYSTEM_USER } from "./constants";
import { MetadataRelationships, MetadataRelationshipsType, RELATIONSHIP_TYPES } from "./relationships.entity";
import { ConditionallyValidateClassAsync } from "../../decorator/validate.decorator";
import { TransformPlainToClass } from "class-transformer";
import { MetadataException } from "./metadata.exception";
import { buildResourcePrefix } from "./utils";

type PutRelationshipsInput = {
  key: string;
  resource: string;
  type: RELATIONSHIP_TYPES;
}[];

export function buildRelationshipsItemKey(id: string) {
  const key = `Relationships:${id}`;
  return { PK: key, SK: key };
}

export const EMPTY_RELATIONSHIPS: MetadataRelationshipsType = {
  ...buildRelationshipsItemKey(NIL_UUID),
  Id: NIL_UUID,
  ItemType: "Relationships",
  CreatedAt: new Date().toISOString(),
  CreatedBy: SYSTEM_USER,
  Data: {
    Relationships: [] as { Key: string; Type: RELATIONSHIP_TYPES; Resource: string }[],
  },
} as const;

@Injectable()
export class RelationshipsService {
  constructor(public configService: ConfigService<AppConfig, true>, private dynamodbService: DynamodbRepository) {}

  buildResourcePrefix = (resource: string) => buildResourcePrefix(resource);

  @ConditionallyValidateClassAsync("VALIDATE_METADATA_ON_READ")
  @TransformPlainToClass(MetadataRelationships)
  public async getRelationships(id: string): Promise<MetadataRelationships> {
    if (id === NIL_UUID) {
      // Must cast to MetadataRelationships because transform decorator cannot change method signature
      return EMPTY_RELATIONSHIPS as MetadataRelationships;
    }

    const key = buildRelationshipsItemKey(id);

    const item = await this.dynamodbService.getItem<MetadataRelationships>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });
    if (item === null) {
      throw new MetadataException(`Failed to retrieve relationships for resource ${id}`);
    }
    return item;
  }

  public async putRelationships(relationships: PutRelationshipsInput): Promise<{ created: false }>;
  public async putRelationships(relationships: PutRelationshipsInput): Promise<{ created: true; id: string }>;
  public async putRelationships(relationships: PutRelationshipsInput): Promise<{ created: boolean; id?: string }> {
    const id = uuidV4();
    const key = buildRelationshipsItemKey(id);
    return this.dynamodbService
      .createItem<MetadataRelationshipsType>({
        table: this.configService.get("RESOURCE_TABLE"),
        item: {
          ...key,
          Id: id,
          ItemType: "Relationships",
          CreatedAt: new Date().toISOString(),
          CreatedBy: SYSTEM_USER,
          Data: {
            Relationships: relationships.map((r) => ({ Key: r.key, Type: r.type, Resource: r.resource })),
          },
        },
      })
      .then(() => ({ created: true, id }))
      .catch((err) => (err.code === "ConditionalCheckFailed" ? { created: false } : Promise.reject(err)));
  }
}
