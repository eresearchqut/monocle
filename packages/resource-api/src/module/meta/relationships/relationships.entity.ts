import { Equals, IsString, Matches, ValidateNested } from "class-validator";
import { ItemEntity } from "../../dynamodb/dynamodb.entity";
import { Form } from "@eresearchqut/form-definition";
import { buildResourceIdentifier, getKeys, jsonPathData } from "../utils";
import { Type } from "class-transformer";
import { SYSTEM_USER } from "../constants";
import { QueryItemArgs } from "../../dynamodb/dynamodb.service";
import { RelationshipsException } from "./relationships.exception";
import { RELATIONSHIP_GSI_INDEX } from "./relationships.constants";

export class Relationship {
  @Matches(/[a-zA-Z0-9_]+/)
  Resource!: string; // TODO: check target resource doesn't have other relationships with same name

  @IsString()
  Key!: string;

  @IsString()
  DataKey!: string;
}

interface DataType {
  Relationships: Map<string, Relationship>;
}

export type MetadataRelationshipsType = ItemEntity<DataType, "Relationships">;

class MetadataRelationshipsData {
  @ValidateNested({ each: true })
  @Type(() => Relationship, {})
  Relationships!: Map<string, Relationship>;
}

// TODO: move some public methods to inner Relationship class
export class MetadataRelationships extends ItemEntity<DataType, "Relationships"> implements MetadataRelationshipsType {
  @Equals("Relationships")
  ItemType: "Relationships" = "Relationships";

  @ValidateNested()
  @Type(() => MetadataRelationshipsData)
  Data!: MetadataRelationshipsData;

  private buildRelationshipItemAttributes = (
    sourceResource: string,
    sourceId: string,
    key: string,
    relationship: [string, Relationship],
    version: number
  ) => ({
    PK: buildResourceIdentifier(sourceResource, sourceId),
    SK: `version#${version}#relationship:${relationship[0]}:${key}`,
    [`GSI${RELATIONSHIP_GSI_INDEX}-PK`]: buildResourceIdentifier(relationship[1].Resource, key),
    [`GSI${RELATIONSHIP_GSI_INDEX}-SK`]: `relationship:${relationship[0]}:${sourceId}`,
  });

  private buildRelationshipItemsAttributes = (
    sourceResource: string,
    sourceId: string,
    data: Form,
    relationship: [string, Relationship],
    version: number
  ): { PK: string; SK: string }[] =>
    Array.from(new Set(getKeys(data, relationship[1].Key))).map((i) =>
      this.buildRelationshipItemAttributes(sourceResource, sourceId, i, relationship, version)
    );

  // TODO: replace flat with reduce
  buildRelationshipsItems = (
    sourceResourceName: string,
    sourceResourceVersion: string,
    sourceId: string,
    data: Form,
    version: number
  ): ItemEntity[] =>
    Array.from(this.Data.Relationships.entries())
      .map((relationship: [string, Relationship]): ItemEntity[] =>
        this.buildRelationshipItemsAttributes(sourceResourceName, sourceId, data, relationship, version).map(
          (attributes) => ({
            ...attributes,
            Id: sourceId,
            ItemType: "ResourceRelationship",
            CreatedAt: new Date().toISOString(),
            CreatedBy: SYSTEM_USER,
            ResourceName: sourceResourceName,
            ResourceVersion: sourceResourceVersion,
            Data: jsonPathData(data, relationship[1].DataKey)?.[0] ?? {},
          })
        )
      )
      .flat();

  buildSourceToTargetQuery = (
    sourceResource: string,
    sourceIdentifier: string,
    sourceVersion: number,
    relationshipName: string
  ): Omit<QueryItemArgs, "table"> => {
    const relationship = this.Data.Relationships.get(relationshipName);

    if (relationship === undefined) {
      throw new RelationshipsException("Invalid relationship name"); // TODO: add test to confirm
    }

    return {
      keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
      expressionNames: {
        "#PK": `PK`,
        "#SK": `SK`,
      },
      expressionValues: {
        ":PK": buildResourceIdentifier(sourceResource, sourceIdentifier),
        ":SKPrefix": `version#${sourceVersion}#relationship:${relationshipName}:`, // TODO: add test to confirm colon postfix
      },
    };
  };

  buildTargetToSourceQuery = (relationshipName: string, targetIdentifier: string): Omit<QueryItemArgs, "table"> => {
    const relationship = this.Data.Relationships.get(relationshipName);

    if (relationship === undefined) {
      throw new RelationshipsException("Invalid relationship name");
    }

    return {
      index: `GSI${RELATIONSHIP_GSI_INDEX}`,
      keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
      expressionNames: {
        "#PK": `GSI${RELATIONSHIP_GSI_INDEX}-PK`,
        "#SK": `GSI${RELATIONSHIP_GSI_INDEX}-SK`,
      },
      expressionValues: {
        ":PK": buildResourceIdentifier(relationship.Resource, targetIdentifier),
        ":SKPrefix": `relationship:${relationshipName}:`, // TODO: add test to confirm colon postfix
      },
    };
  };

  buildDeletionQuery = (
    sourceResource: string,
    sourceIdentifier: string,
    sourceVersion: number
  ): Omit<QueryItemArgs, "table"> => ({
    keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
    expressionNames: {
      "#PK": `PK`,
      "#SK": `SK`,
    },
    expressionValues: {
      ":PK": buildResourceIdentifier(sourceResource, sourceIdentifier),
      ":SKPrefix": `version#${sourceVersion}#`, // TODO: add test to confirm hash postfix
    },
  });

  hasRelationships = () => this.Data.Relationships.size > 0;
}
