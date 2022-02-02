import { Equals, IsEnum, IsString, ValidateNested } from "class-validator";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import { RELATIONSHIP_TYPES } from "./metadata.entity";

interface DataType {
  Relationships: Map<string, Relationship>;
}

export type MetadataRelationshipsType = ItemEntity<DataType, "Relationships">;

class MetadataRelationshipData {
  @ValidateNested({ each: true })
  Relationships: Map<string, Relationship>;
}

class Relationship {
  @IsString({ each: true })
  Key: string[];

  @IsEnum(RELATIONSHIP_TYPES)
  Type: RELATIONSHIP_TYPES;
}

export class MetadataRelationships extends ItemEntity<DataType, "Relationships"> implements MetadataRelationshipsType {
  @Equals("Relationships")
  ItemType: "Relationships" = "Relationships";

  @ValidateNested()
  Data: MetadataRelationshipData;
}
