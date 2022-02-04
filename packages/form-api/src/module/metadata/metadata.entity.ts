import { Equals, IsSemVer, IsUUID, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { v4 } from "uuid";
import { ItemEntity } from "../dynamodb/dynamodb.entity";

interface DataType {
  Resource: string;
  Version: string;
  Schemas: {
    FormVersion: string;
    AuthorizationVersion: string;
    RelationshipsVersion: string;
  };
}

export type MetadataEntityType = ItemEntity<DataType, "Metadata">;

class SchemaData {
  @IsUUID()
  FormVersion!: string;

  @IsUUID()
  AuthorizationVersion!: string;

  @IsUUID()
  RelationshipsVersion!: string;
}

export class MetadataData {
  @Matches(/[a-zA-Z0-9_]+/)
  Resource!: string;

  @IsSemVer()
  Version!: string;

  @ValidateNested()
  @Type(() => SchemaData)
  Schemas!: SchemaData;
}

export class Metadata extends ItemEntity<DataType, "Metadata"> implements MetadataEntityType {
  @Equals("Metadata")
  ItemType: "Metadata" = "Metadata";

  @ValidateNested()
  @Type(() => MetadataData)
  Data!: MetadataData;

  buildGetAttributes = (id: string) => {
    const key = `Resource:${this.Data.Resource}#data:${id}`;
    return { PK: key, SK: key };
  };

  buildPutAttributes = (input: { id?: string; user: string; resource: { name: string; version: string } }) => {
    const id = input.id ?? v4();
    const { PK, SK } = this.buildGetAttributes(id);
    return {
      Id: id,
      PK,
      SK,
      ItemType: "Resource",
      CreatedAt: new Date().toISOString(),
      CreatedBy: input.user,
      ResourceName: input.resource.name,
      ResourceVersion: input.resource.version,
    };
  };
}
