import { Equals, IsEnum, IsString, Matches, ValidateNested } from "class-validator";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import { Form } from "@eresearchqut/form-definition";
import { get } from "lodash";
import { buildResourceIdentifier } from "./utils";

export enum RELATIONSHIP_TYPES {
  COMPOSITE = "COMPOSITE",
  INDEX = "INDEX",
}

interface DataType {
  Relationships: Relationship[];
}

export type MetadataRelationshipsType = ItemEntity<DataType, "Relationships">;

const descendData = (data: any, key: string[]): any => {
  if (key.length === 1) {
    return data[key[0]];
  } else {
    const inner = data[key.pop() as string];
    if (inner === undefined) {
      throw new Error("Failed retrieving key for relationship");
    }
    return descendData(inner, key);
  }
};

class MetadataRelationshipData {
  @ValidateNested({ each: true })
  Relationships!: Relationship[];
}

class Relationship {
  @Matches(/[a-zA-Z0-9_]+/)
  Resource!: string;

  @IsString({ each: true })
  Key!: string;

  @IsEnum(RELATIONSHIP_TYPES)
  Type!: RELATIONSHIP_TYPES;
}

export class MetadataRelationships extends ItemEntity<DataType, "Relationships"> implements MetadataRelationshipsType {
  @Equals("Relationships")
  ItemType: "Relationships" = "Relationships";

  @ValidateNested()
  Data!: MetadataRelationshipData;

  buildRelationshipIndexKeys = (sourceKey: string, data: Form): Record<string, string> =>
    this.Data.Relationships.filter((r) => r.Type === RELATIONSHIP_TYPES.INDEX).reduce((keys, relationship, index) => {
      const identifier = get(data, relationship.Key);
      if (identifier === undefined || identifier === null) {
        throw new Error(`Failed retrieving relationship key ${relationship.Key}`);
      }
      if (typeof identifier !== "string") {
        throw new Error(`Invalid relationship key value ${identifier} for key ${relationship.Key}`);
      }

      index++;
      keys[`GSI${index}-PK`] = buildResourceIdentifier(relationship.Resource, identifier);
      keys[`GSI${index}-SK`] = sourceKey;

      return keys;
    }, {} as Record<string, string>);
}
