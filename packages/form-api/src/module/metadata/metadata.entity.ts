import {
  Equals,
  IsAlphanumeric,
  IsISO8601,
  IsObject,
  IsSemVer,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { v4 } from "uuid";
import { MetadataException } from "./metadata.exception";
import Ajv from "ajv";
import { ItemEntity } from "../dynamodb/dynamodb.entity";

export const DEFAULT_GROUP_NAME = "Default";

export type MetadataEntityType = ItemEntity<
  {
    Resource: string;
    Version: string;
    Groups: {
      [groupName: string]: {
        formVersion: string;
        authorizationVersion: string;
      };
    };
  },
  "Metadata"
>;

export class MetadataData {
  @IsString()
  Resource: string;

  @IsSemVer()
  Version: string;

  @ValidateNested({ each: true })
  @Type(() => GroupMetadata)
  Groups: { [key: string]: GroupMetadata };
}

class GroupMetadata {
  @IsUUID()
  formVersion: string;

  @IsUUID()
  authorizationVersion: string;
}

export class Metadata implements MetadataEntityType {
  @IsString()
  Id: string;

  @IsString()
  PK: string;

  @IsString()
  SK?: string;

  @Equals("Metadata")
  ItemType: "Metadata" = "Metadata";

  @IsISO8601()
  CreatedAt: string;

  @IsString()
  CreatedBy: string;

  @ValidateNested()
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
    const groupMetadata = this.Data.Groups[group || DEFAULT_GROUP_NAME];
    if (groupMetadata === undefined) {
      throw new MetadataException(`Metadata group ${group} not found`);
    }
    return groupMetadata;
  };
}

export class MetadataQuery extends Array<Metadata> {}
