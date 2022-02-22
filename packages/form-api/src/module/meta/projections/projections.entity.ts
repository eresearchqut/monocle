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
import { PROJECTION_TYPES } from "./projections.constants";
import { JSONPath } from "jsonpath-plus";

abstract class Projection {
  @Matches(/[a-zA-Z0-9_]+/)
  Resource!: string; // TODO: check target resource doesn't have other projections with same name

  @IsString()
  Key!: string;

  @IsEnum(PROJECTION_TYPES)
  Type!: PROJECTION_TYPES;
}

class IndexRelationship extends Projection {
  @Equals(PROJECTION_TYPES.INDEX)
  Type!: PROJECTION_TYPES.INDEX;

  // Required because DynamoDB's Map doesn't preserve order
  @Min(1)
  @Max(20)
  Index!: number;
}

class CompositeRelationship extends Projection {
  @Equals(PROJECTION_TYPES.COMPOSITE)
  Type!: PROJECTION_TYPES.COMPOSITE;

  @IsString()
  DataKey!: string;
}

export type ConcreteProjections = IndexRelationship | CompositeRelationship;

interface DataType {
  Projections: Map<string, ConcreteProjections>;
}

export type MetadataProjectionsType = ItemEntity<DataType, "Projections">;

class MetadataProjectionsData {
  @ValidateNested({ each: true })
  @Type(() => Projection, {
    discriminator: {
      property: "Type",
      subTypes: [
        { value: IndexRelationship, name: PROJECTION_TYPES.INDEX },
        { value: CompositeRelationship, name: PROJECTION_TYPES.COMPOSITE },
      ],
    },
  })
  Projections!: Map<string, ConcreteProjections>;
}

const getIdentifiers = (data: Form, key: string): Set<string> => {
  const identifiers = JSONPath({ path: key, json: data, wrap: true, preventEval: true });
  if (identifiers === undefined || identifiers === null || !Array.isArray(identifiers)) {
    throw new Error(`Failed retrieving projection key ${key}`);
  }

  return new Set(
    identifiers.map((i) => {
      if (typeof i !== "string") {
        throw new Error(`Invalid projection key value ${i} for key ${key}`);
      }
      return i;
    })
  );
};

export class MetadataProjections extends ItemEntity<DataType, "Projections"> implements MetadataProjectionsType {
  @Equals("Projections")
  ItemType: "Projections" = "Projections";

  @ValidateNested()
  @Type(() => MetadataProjectionsData)
  Data!: MetadataProjectionsData;

  private filterProjections(relationshipType: PROJECTION_TYPES.INDEX): [string, IndexRelationship][];
  private filterProjections(relationshipType: PROJECTION_TYPES.COMPOSITE): [string, CompositeRelationship][];
  private filterProjections(relationshipType: PROJECTION_TYPES): [string, IndexRelationship | CompositeRelationship][] {
    return Array.from(this.Data.Projections.entries()).filter(
      (r): r is [string, IndexRelationship | CompositeRelationship] => r[1].Type === relationshipType
    );
  }

  buildRelationshipsIndexKeys = (sourceResource: string, sourceId: string, data: Form): Record<string, string> =>
    this.filterProjections(PROJECTION_TYPES.INDEX).reduce((keys, [name, relationship]) => {
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

  private buildRelationshipItemCompositeAttributes = (
    sourceResource: string,
    sourceId: string,
    targetId: string,
    relationship: [string, CompositeRelationship]
  ) => ({
    PK: buildResourceIdentifier(relationship[1].Resource, targetId),
    SK: `${relationship[0]}:${buildResourceIdentifier(sourceResource, sourceId)}`,
  });

  private buildRelationshipItemsCompositeAttributes = (
    sourceResource: string,
    sourceId: string,
    data: Form,
    relationship: [string, CompositeRelationship]
  ): { PK: string; SK: string }[] =>
    Array.from(getIdentifiers(data, relationship[1].Key)).map((i) =>
      this.buildRelationshipItemCompositeAttributes(sourceResource, sourceId, i, relationship)
    );

  buildRelationshipsCompositeAttributes = (sourceResource: string, sourceId: string, data: Form) =>
    this.filterProjections(PROJECTION_TYPES.COMPOSITE)
      .map((relationship) =>
        this.buildRelationshipItemsCompositeAttributes(sourceResource, sourceId, data, relationship)
      )
      .flat();

  buildRelationshipsCompositeItems = (sourceResource: string, sourceId: string, data: Form): ItemEntity[] =>
    this.filterProjections(PROJECTION_TYPES.COMPOSITE)
      .map(([name, relationship]) =>
        this.buildRelationshipItemsCompositeAttributes(sourceResource, sourceId, data, [name, relationship]).map(
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
    this.filterProjections(PROJECTION_TYPES.COMPOSITE).reduce((keys, [name, relationship]) => {
      const oldIds = getIdentifiers(oldData, relationship.Key);
      const newIds = getIdentifiers(newData, relationship.Key);

      // JS set difference is missing :( https://stackoverflow.com/a/36504668
      keys.push(
        ...[...oldIds]
          .filter((i) => !newIds.has(i))
          .map((i) => this.buildRelationshipItemCompositeAttributes(sourceResource, sourceId, i, [name, relationship]))
      );

      return keys;
    }, [] as { PK: string; SK: string }[]);

  buildQuery = (relationshipName: string, sourceIdentifier: string): Omit<QueryItemArgs, "table"> => {
    const relationship = this.Data.Projections.get(relationshipName);

    if (relationship === undefined) {
      throw new RelationshipException("Invalid relationship");
    }

    const pk = buildResourceIdentifier(relationship.Resource, sourceIdentifier);

    return match(relationship)
      .with({ Type: PROJECTION_TYPES.INDEX }, (r) => ({
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
      .with({ Type: PROJECTION_TYPES.COMPOSITE }, () => ({
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
