import { Equals, IsEnum, IsString, Matches, Max, Min, ValidateNested } from "class-validator";
import { ItemEntity } from "../../dynamodb/dynamodb.entity";
import { Form } from "@eresearchqut/form-definition";
import { get } from "lodash";
import { buildResourceIdentifier } from "../utils";
import { Type } from "class-transformer";
import { SYSTEM_USER } from "../constants";
import { RelationshipException } from "../../resource/resource.exception";
import { match } from "ts-pattern";
import { QueryItemArgs } from "../../dynamodb/dynamodb.repository";
import { RELATIONSHIP_TYPES } from "./relationships.constants";
import { JSONPath } from "jsonpath-plus";

abstract class Relationship {
  @Matches(/[a-zA-Z0-9_]+/)
  Resource!: string; // TODO: check target resource doesn't have other relationships with same name

  @IsString()
  Key!: string;

  @IsEnum(RELATIONSHIP_TYPES)
  Type!: RELATIONSHIP_TYPES;
}

class IndexRelationship extends Relationship {
  @Equals(RELATIONSHIP_TYPES.INDEX)
  Type!: RELATIONSHIP_TYPES.INDEX;

  // Required because DynamoDB's Map doesn't preserve order
  @Min(1)
  @Max(20)
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

const getIdentifiers = (data: Form, key: string): Set<string> => {
  // TODO: Replace lodash get with something like jq that can return multiple
  // const identifier = get(data, key);
  const identifiers = JSONPath({ path: key, json: data, wrap: true, preventEval: true });
  if (identifiers === undefined || identifiers === null || !Array.isArray(identifiers)) {
    throw new Error(`Failed retrieving relationship key ${key}`);
  }

  return new Set(
    identifiers.map((i) => {
      if (typeof i !== "string") {
        throw new Error(`Invalid relationship key value ${i} for key ${key}`);
      }
      return i;
    })
  );
};

export class MetadataRelationships extends ItemEntity<DataType, "Relationships"> implements MetadataRelationshipsType {
  @Equals("Relationships")
  ItemType: "Relationships" = "Relationships";

  @ValidateNested()
  @Type(() => MetadataRelationshipData)
  Data!: MetadataRelationshipData;

  private filterRelationships(relationshipType: RELATIONSHIP_TYPES.INDEX): [string, IndexRelationship][];
  private filterRelationships(relationshipType: RELATIONSHIP_TYPES.COMPOSITE): [string, CompositeRelationship][];
  private filterRelationships(
    relationshipType: RELATIONSHIP_TYPES
  ): [string, IndexRelationship | CompositeRelationship][] {
    return Array.from(this.Data.Relationships.entries()).filter(
      (r): r is [string, IndexRelationship | CompositeRelationship] => r[1].Type === relationshipType
    );
  }

  buildRelationshipsIndexKeys = (sourceResource: string, sourceId: string, data: Form): Record<string, string> =>
    this.filterRelationships(RELATIONSHIP_TYPES.INDEX).reduce((keys, [name, relationship]) => {
      const identifiers = getIdentifiers(data, relationship.Key);

      if (identifiers.size === 1) {
        keys[`GSI${relationship.Index}-PK`] = buildResourceIdentifier(
          relationship.Resource,
          identifiers.values().next().value
        );
        keys[`GSI${relationship.Index}-SK`] = `${name}:${buildResourceIdentifier(sourceResource, sourceId)}`;
      }

      return keys;
    }, {} as Record<string, string>);

  private buildRelationshipCompositeAttributes = (
    sourceResource: string,
    sourceId: string,
    data: Form,
    relationship: [string, CompositeRelationship]
  ): { PK: string; SK: string }[] =>
    Array.from(getIdentifiers(data, relationship[1].Key)).map((i) => ({
      PK: buildResourceIdentifier(relationship[1].Resource, i),
      SK: `${relationship[0]}:${buildResourceIdentifier(sourceResource, sourceId)}`,
    }));

  buildRelationshipsCompositeAttributes = (sourceResource: string, sourceId: string, data: Form) =>
    this.filterRelationships(RELATIONSHIP_TYPES.COMPOSITE)
      .map((relationship) => this.buildRelationshipCompositeAttributes(sourceResource, sourceId, data, relationship))
      .flat();

  buildRelationshipsCompositeItems = (sourceResource: string, sourceId: string, data: Form): ItemEntity[] =>
    this.filterRelationships(RELATIONSHIP_TYPES.COMPOSITE)
      .map(([name, relationship]) =>
        this.buildRelationshipCompositeAttributes(sourceResource, sourceId, data, [name, relationship]).map(
          (attributes) => ({
            ...attributes,
            Id: sourceId,
            ItemType: "CompositeRelationship",
            CreatedAt: new Date().toISOString(),
            CreatedBy: SYSTEM_USER,
            Data: get(data, relationship.DataKey) || {},
          })
        )
      )
      .flat();

  buildRelationshipOldCompositeAttributes = (sourceResource: string, sourceId: string, oldData: Form, newData: Form) =>
    this.filterRelationships(RELATIONSHIP_TYPES.COMPOSITE).reduce((keys, [name, relationship]) => {
      const oldId = getIdentifiers(oldData, relationship.Key);
      const newId = getIdentifiers(newData, relationship.Key);

      if (oldId !== newId) {
        keys.push(
          ...this.buildRelationshipCompositeAttributes(sourceResource, sourceId, oldData, [name, relationship])
        );
      }

      return keys;
    }, [] as { PK: string; SK: string }[]);

  buildQuery = (relationshipName: string, sourceIdentifier: string): Omit<QueryItemArgs, "table"> => {
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
      .with({ Type: RELATIONSHIP_TYPES.COMPOSITE }, () => ({
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
