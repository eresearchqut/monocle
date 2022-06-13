import { Equals, IsSemVer, IsUUID, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { v4 } from "uuid";
import { ItemEntity } from "../../dynamodb/dynamodb.entity";
import { buildResourceIdentifier } from "../utils";
import { QueryItemArgs } from "../../dynamodb/dynamodb.service";
import { RESOURCE_GSI_INDEX } from "./metadata.constants";

// TODO: versioned / longitudinal resources
// TODO: nested / hierarchical resources
// TODO: enforce consistency type

interface DataType {
  Resource: string;
  Version: string;
  Schemas: {
    FormVersion: string;
    AuthorizationVersion: string;
    RelationshipsVersion: string;
    ConstraintsVersion: string;
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

  @IsUUID()
  ConstraintsVersion!: string;
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
    const key = buildResourceIdentifier(this.Data.Resource, id);
    return { PK: key, SK: key };
  };

  buildQuery = (): Omit<QueryItemArgs, "table"> => ({
    index: `GSI${RESOURCE_GSI_INDEX}`,
    keyCondition: "#PK = :PK",
    expressionNames: {
      "#PK": "ResourceName",
    },
    expressionValues: {
      ":PK": this.Data.Resource,
    },
  });

  buildPutAttributes = (input: {
    id?: string;
    user: string;
    resource: { name: string; version: string };
    version?: number;
  }) => {
    const id = input.id ?? v4();
    const { PK, SK } = this.buildGetAttributes(id);
    return {
      Id: id,
      PK,
      SK,
      ItemType: "Resource",
      // TODO: Use a request-global timestamp & user
      // TODO: Use epoch time for DDB TTL
      CreatedAt: new Date().toISOString(),
      CreatedBy: input.user,
      ResourceName: input.resource.name,
      ResourceVersion: input.resource.version,
    };
  };
}
