import { IsAlphanumeric, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { v4 } from "uuid";
import { MetadataException } from "./metadata.exception";
import Ajv from "ajv";
import { ItemEntity } from "../dynamodb/dynamodb.entity";

const DEFAULT_GROUP_NAME = "default";

export class Metadata extends ItemEntity {
  @IsAlphanumeric()
  resource: string;

  @ValidateNested({ each: true })
  @Type(() => GroupMetadata)
  groups: Map<string, GroupMetadata>;

  public getDataKey(id: string): [string, string] {
    const key = `Resource:${this.resource}#data:${id}`;
    return [key, key];
  }

  public createDataKey(): [string, string] {
    return this.getDataKey(v4());
  }

  public getGroupMetadata(group?: string): GroupMetadata {
    const groupMetadata = this.groups.get(group || DEFAULT_GROUP_NAME);
    if (groupMetadata === undefined) {
      throw new MetadataException(`Metadata group ${group} not found`);
    }
    return groupMetadata;
  }
}

export class GroupMetadata {
  @IsUUID()
  formVersion: string;

  @IsUUID()
  authorizationVersion: string;
}

export class MetadataForm extends ItemEntity {
  schema: any;

  public validate(data: any) {
    const ajv = new Ajv();
    const validate = ajv.compile(this.schema);
    validate(data);
    return validate.errors;
  }
}

export class MetadataAuthorization extends ItemEntity {
  policy: any;
}