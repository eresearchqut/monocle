import { Equals, IsEnum, IsString, ValidateNested } from "class-validator";
import { ItemEntity } from "../dynamodb/dynamodb.entity";

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
  @IsString({ each: true })
  Key!: string[];

  @IsEnum(RELATIONSHIP_TYPES)
  Type!: RELATIONSHIP_TYPES;
}

export class MetadataRelationships extends ItemEntity<DataType, "Relationships"> implements MetadataRelationshipsType {
  @Equals("Relationships")
  ItemType: "Relationships" = "Relationships";

  @ValidateNested()
  Data!: MetadataRelationshipData;

  buildRelationshipKeys = (data: Record<string, unknown>) =>
    this.Data.Relationships.reduce((keys, relationship, index) => {
      const identifier: string = descendData(data, relationship.Key);

      return {};
    }, {});
}
