import { Equals, IsEnum, IsSemVer, IsString, IsUUID, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { v4 } from "uuid";
import { MetadataException } from "./metadata.exception";
import { ItemEntity } from "../dynamodb/dynamodb.entity";

export const DEFAULT_GROUP_NAME = "Default";

export enum RELATIONSHIP_TYPES {
  ONE_TO_ONE = "ONE_TO_ONE",
  ONE_TO_MANY = "ONE_TO_MANY",
  MANY_TO_MANY = "MANY_TO_MANY",
}

interface DataType {
  Resource: string;
  Version: string;
  Groups: Map<
    string,
    {
      formVersion: string;
      authorizationVersion: string;
    }
  >;
  Relationships: Map<
    string,
    {
      type: RELATIONSHIP_TYPES;
      key: string[];
    }
  >;
}

export type MetadataEntityType = ItemEntity<DataType, "Metadata">;

export class MetadataData {
  @Matches(/[a-zA-Z0-9_]+/)
  Resource: string;

  @IsSemVer()
  Version: string;

  @ValidateNested({ each: true })
  @Type(() => GroupMetadata)
  Groups: Map<string, GroupMetadata>;

  @ValidateNested({ each: true })
  @Type(() => RelationshipMetadata)
  Relationships: Map<string, RelationshipMetadata>;
}

class GroupMetadata {
  @IsUUID()
  formVersion: string;

  @IsUUID()
  authorizationVersion: string;
}

class RelationshipMetadata {
  @IsEnum(RELATIONSHIP_TYPES)
  type: RELATIONSHIP_TYPES;

  @IsString()
  @ValidateNested({ each: true })
  key: string[];
}

export class Metadata extends ItemEntity<DataType, "Metadata"> implements MetadataEntityType {
  @Equals("Metadata")
  ItemType: "Metadata" = "Metadata";

  @ValidateNested()
  @Type(() => MetadataData)
  Data: MetadataData;

  getDataKey = (id: string) => {
    const key = `Resource:${this.Data.Resource}#data:${id}`;
    return { PK: key, SK: key };
  };

  createDataKey = () => {
    const id = v4();
    const key = this.getDataKey(id);
    return { id, key };
  };

  getGroupMetadata = (group?: string): GroupMetadata => {
    const groupMetadata = this.Data.Groups.get(group || DEFAULT_GROUP_NAME);
    if (groupMetadata === undefined) {
      throw new MetadataException(`Metadata group ${group} not found`);
    }
    return groupMetadata;
  };
}
