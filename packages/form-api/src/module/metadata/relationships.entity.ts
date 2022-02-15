import { Equals, IsEnum, IsPositive, IsString, Matches, ValidateNested } from "class-validator";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import { Form } from "@eresearchqut/form-definition";
import { get } from "lodash";
import { buildResourceIdentifier } from "./utils";
import { Type } from "class-transformer";
import { RELATIONSHIP_TYPES, SYSTEM_USER } from "./constants";
import { RelationshipException } from "../resource/resource.exception";
import { match } from "ts-pattern";

abstract class Relationship {
  @Matches(/[a-zA-Z0-9_]+/)
  Resource!: string;

  @IsString()
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

  @IsString()
  DataKey!: string;
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

const getIdentifier = (data: Form, key: string) => {
  // TODO: Replace lodash get with something like jq that can return multiple
  const identifier = get(data, key);
  if (identifier === undefined || identifier === null) {
    throw new Error(`Failed retrieving relationship key ${key}`);
  }
  if (typeof identifier !== "string") {
    throw new Error(`Invalid relationship key value ${identifier} for key ${key}`);
  }
  return identifier;
};

export class MetadataRelationships extends ItemEntity<DataType, "Relationships"> implements MetadataRelationshipsType {
  @Equals("Relationships")
  ItemType: "Relationships" = "Relationships";

  @ValidateNested()
  @Type(() => MetadataRelationshipData)
  Data!: MetadataRelationshipData;

  buildRelationshipIndexKeys = (sourceResource: string, sourceId: string, data: Form): Record<string, string> => {
    const sourceIdentifier = buildResourceIdentifier(sourceResource, sourceId);

    return Array.from(this.Data.Relationships.entries())
      .filter((r): r is [string, IndexRelationship] => r[1].Type === RELATIONSHIP_TYPES.INDEX)
      .reduce((keys, [name, relationship]) => {
        keys[`GSI${relationship.Index}-PK`] = buildResourceIdentifier(
          relationship.Resource,
          getIdentifier(data, relationship.Key)
        );
        keys[`GSI${relationship.Index}-SK`] = `${name}:${sourceIdentifier}`;

        return keys;
      }, {} as Record<string, string>);
  };

  buildRelationshipCompositeItems = (sourceResource: string, sourceId: string, data: Form): ItemEntity[] => {
    const sourceIdentifier = buildResourceIdentifier(sourceResource, sourceId);

    return Array.from(this.Data.Relationships.entries())
      .filter((r): r is [string, CompositeRelationship] => r[1].Type === RELATIONSHIP_TYPES.COMPOSITE)
      .map(([name, relationship]) => ({
        Id: sourceId,
        PK: buildResourceIdentifier(relationship.Resource, getIdentifier(data, relationship.Key)),
        SK: `${name}:${sourceIdentifier}`,
        ItemType: "CompositeRelationship",
        CreatedAt: new Date().toISOString(),
        CreatedBy: SYSTEM_USER,
        Data: get(data, relationship.DataKey) || {},
      }));
  };

  buildQuery = (relationshipName: string, sourceIdentifier: string) => {
    const relationship = this.Data.Relationships.get(relationshipName);

    if (relationship === undefined) {
      throw new RelationshipException("Invalid relationship");
    }

    const pk = buildResourceIdentifier(relationship.Resource, sourceIdentifier);

    return match(relationship)
      .with({ Type: RELATIONSHIP_TYPES.INDEX }, (r) => ({
        index: `GSI${r.Index}`,
        keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
        expressionNames: {
          "#PK": `GSI${r.Index}-PK`,
          "#SK": `GSI${r.Index}-SK`,
        },
        expressionValues: {
          ":PK": pk,
          ":SKPrefix": `${relationshipName}:`,
        },
      }))
      .with({ Type: RELATIONSHIP_TYPES.COMPOSITE }, (r) => ({
        keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
        expressionNames: {
          "#PK": `PK`,
          "#SK": `SK`,
        },
        expressionValues: {
          ":PK": pk,
          ":SKPrefix": `${relationshipName}:`,
        },
      }))
      .exhaustive();
  };
}
