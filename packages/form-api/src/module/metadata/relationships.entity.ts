import { Equals, IsEnum, IsPositive, IsString, Matches, ValidateNested } from "class-validator";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import { Form } from "@eresearchqut/form-definition";
import { get } from "lodash";
import { buildResourceIdentifier } from "./utils";
import { Type } from "class-transformer";
import { RELATIONSHIP_TYPES } from "./constants";

abstract class Relationship {
  @Matches(/[a-zA-Z0-9_]+/)
  Resource!: string;

  @IsString({ each: true })
  Key!: string;

  @IsEnum(RELATIONSHIP_TYPES)
  Type!: RELATIONSHIP_TYPES;
}

class IndexRelationship extends Relationship {
  @Equals(RELATIONSHIP_TYPES.INDEX)
  Type!: RELATIONSHIP_TYPES.INDEX;

  // Required because DynamoDB's Map doesn't preserve order
  @IsPositive()
  Index!: number;
}

class CompositeRelationship extends Relationship {
  @Equals(RELATIONSHIP_TYPES.COMPOSITE)
  Type!: RELATIONSHIP_TYPES.COMPOSITE;
}

export type ConcreteRelationships = IndexRelationship | CompositeRelationship;

interface DataType {
  Relationships: Map<string, ConcreteRelationships>;
}

export type MetadataRelationshipsType = ItemEntity<DataType, "Relationships">;
class MetadataRelationshipData {
  @ValidateNested({ each: true })
  @Type(() => Relationship, {
    discriminator: {
      property: "Type",
      subTypes: [
        { value: IndexRelationship, name: RELATIONSHIP_TYPES.INDEX },
        { value: CompositeRelationship, name: RELATIONSHIP_TYPES.COMPOSITE },
      ],
    },
  })
  Relationships!: Map<string, ConcreteRelationships>;
}

export class MetadataRelationships extends ItemEntity<DataType, "Relationships"> implements MetadataRelationshipsType {
  @Equals("Relationships")
  ItemType: "Relationships" = "Relationships";

  @ValidateNested()
  @Type(() => MetadataRelationshipData)
  Data!: MetadataRelationshipData;

  // TODO: Memoize
  buildRelationshipIndexKeys = (sourceKey: string, data: Form): Record<string, string> =>
    Array.from(this.Data.Relationships.values())
      .filter((r): r is IndexRelationship => r.Type === RELATIONSHIP_TYPES.INDEX)
      .reduce((keys, relationship) => {
        const identifier = get(data, relationship.Key);
        if (identifier === undefined || identifier === null) {
          throw new Error(`Failed retrieving relationship key ${relationship.Key}`);
        }
        if (typeof identifier !== "string") {
          throw new Error(`Invalid relationship key value ${identifier} for key ${relationship.Key}`);
        }

        keys[`GSI${relationship.Index}-PK`] = buildResourceIdentifier(relationship.Resource, identifier);
        keys[`GSI${relationship.Index}-SK`] = sourceKey;

        return keys;
      }, {} as Record<string, string>);
}
