import { Equals, IsEnum, IsOptional, IsString, Matches, Max, Min, ValidateNested } from "class-validator";
import { ItemEntity } from "../../dynamodb/dynamodb.entity";
import { Form } from "@eresearchqut/form-definition";
import { buildResourceIdentifier } from "../utils";
import { Type } from "class-transformer";
import { SYSTEM_USER } from "../constants";
import { match } from "ts-pattern";
import { QueryItemArgs } from "../../dynamodb/dynamodb.service";
import { NUMERIC_KEY_PADDING, PROJECTION_TYPES } from "./projections.constants";
import { JSONPath } from "jsonpath-plus";
import { ProjectionsException } from "./projections.exception";

abstract class Projection {
  @Matches(/[a-zA-Z0-9_]+/)
  @IsOptional()
  Resource?: string; // TODO: check target resource doesn't have other projections with same name

  @IsString()
  Key!: string;

  @IsEnum(PROJECTION_TYPES)
  Type!: PROJECTION_TYPES;
}

class IndexProjection extends Projection {
  @Equals(PROJECTION_TYPES.INDEX)
  Type!: PROJECTION_TYPES.INDEX;

  // Required because DynamoDB's Map doesn't preserve order
  @Min(1)
  @Max(20)
  Index!: number;
}

class CompositeProjection extends Projection {
  @Equals(PROJECTION_TYPES.COMPOSITE)
  Type!: PROJECTION_TYPES.COMPOSITE;

  @IsString()
  DataKey!: string;

  // TODO: allow enforcing consistency type
}

export type ConcreteProjections = IndexProjection | CompositeProjection;

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
        { value: IndexProjection, name: PROJECTION_TYPES.INDEX },
        { value: CompositeProjection, name: PROJECTION_TYPES.COMPOSITE },
      ],
    },
  })
  Projections!: Map<string, ConcreteProjections>;
}

const jsonPathData = (data: any, key: string) => JSONPath({ path: key, json: data, wrap: true, preventEval: true });

const getKeys = (data: Form, key: string): Set<string> => {
  const keys = jsonPathData(data, key);
  if (keys === undefined || keys === null || !Array.isArray(keys)) {
    throw new Error(`Failed retrieving projection key ${key}`);
  }

  return new Set(
    keys.map((i) => {
      if (i === undefined || typeof i === "object") {
        throw new Error(`Invalid projection key value ${i} for key ${key}`);
      }
      if (typeof i === "number") {
        if (i < 0) {
          throw new Error(`Invalid projection key value numeric ${i} for key ${key}`);
        }
        return i.toString().padStart(NUMERIC_KEY_PADDING, "0");
      }
      if (typeof i === "boolean") {
        return i.toString();
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

  private filterProjections(projectionType: PROJECTION_TYPES.INDEX): [string, IndexProjection][];
  private filterProjections(projectionType: PROJECTION_TYPES.COMPOSITE): [string, CompositeProjection][];
  private filterProjections(projectionType: PROJECTION_TYPES): [string, IndexProjection | CompositeProjection][] {
    return Array.from(this.Data.Projections.entries()).filter(
      (r): r is [string, IndexProjection | CompositeProjection] => r[1].Type === projectionType
    );
  }

  buildProjectionsIndexKeys = (sourceResource: string, sourceId: string, data: Form): Record<string, string> =>
    this.filterProjections(PROJECTION_TYPES.INDEX).reduce((allKeys, [name, projection]) => {
      const keys = getKeys(data, projection.Key);
      const key = keys.values().next().value;

      if (key === undefined) {
        return allKeys;
      }

      if (projection.Resource) {
        allKeys[`GSI${projection.Index}-PK`] = buildResourceIdentifier(projection.Resource, key);
        allKeys[`GSI${projection.Index}-SK`] = `${name}:${buildResourceIdentifier(sourceResource, sourceId)}`; // TODO: don't build each time
      } else {
        allKeys[`GSI${projection.Index}-PK`] = sourceResource; // TODO better PK
        allKeys[`GSI${projection.Index}-SK`] = `${name}:${key}:${sourceId}`;
      }

      return allKeys;
    }, {} as Record<string, string>);

  private buildProjectionItemCompositeAttributes = (
    sourceResource: string,
    sourceId: string,
    key: string,
    projection: [string, CompositeProjection]
  ) => {
    if (projection[1].Resource) {
      return {
        PK: buildResourceIdentifier(projection[1].Resource, key),
        SK: `${projection[0]}:${buildResourceIdentifier(sourceResource, sourceId)}`, // TODO: don't build each time
      };
    } else {
      return {
        PK: sourceResource, // TODO better PK
        SK: `${projection[0]}:${key}:${sourceId}`,
      };
    }
  };

  private buildProjectionItemsCompositeAttributes = (
    sourceResource: string,
    sourceId: string,
    data: Form,
    projection: [string, CompositeProjection]
  ): { PK: string; SK: string }[] =>
    Array.from(getKeys(data, projection[1].Key)).map((i) =>
      this.buildProjectionItemCompositeAttributes(sourceResource, sourceId, i, projection)
    );

  buildProjectionsCompositeAttributes = (sourceResource: string, sourceId: string, data: Form) =>
    this.filterProjections(PROJECTION_TYPES.COMPOSITE)
      .map((projection) => this.buildProjectionItemsCompositeAttributes(sourceResource, sourceId, data, projection))
      .flat(); // TODO: replace with reduce

  buildProjectionsCompositeItems = (sourceResource: string, sourceId: string, data: Form): ItemEntity[] =>
    this.filterProjections(PROJECTION_TYPES.COMPOSITE)
      .map(([name, projection]) =>
        this.buildProjectionItemsCompositeAttributes(sourceResource, sourceId, data, [name, projection]).map(
          (attributes) => ({
            ...attributes,
            Id: sourceId,
            ItemType: projection.Resource ? "CompositeRelationship" : "CompositeProjection",
            CreatedAt: new Date().toISOString(),
            CreatedBy: SYSTEM_USER,
            Data: jsonPathData(data, projection.DataKey)?.[0] ?? {},
          })
        )
      )
      .flat(); // TODO: replace with reduce

  buildProjectionOldCompositeAttributes = (sourceResource: string, sourceId: string, oldData: Form, newData: Form) =>
    this.filterProjections(PROJECTION_TYPES.COMPOSITE).reduce((removedKeys, [name, projection]) => {
      const prevKeys = getKeys(oldData, projection.Key);
      const newKeys = getKeys(newData, projection.Key);

      // JS set difference is missing :( https://stackoverflow.com/a/36504668
      removedKeys.push(
        ...[...prevKeys]
          .filter((k) => !newKeys.has(k))
          .map((k) => this.buildProjectionItemCompositeAttributes(sourceResource, sourceId, k, [name, projection]))
      );

      return removedKeys;
    }, [] as { PK: string; SK: string }[]);

  buildPrimitiveProjectionQuery = (
    projectionName: string,
    resource: string,
    reverse: boolean,
    query?: string
  ): Omit<QueryItemArgs, "table"> => {
    const projection = this.Data.Projections.get(projectionName);

    if (projection === undefined || projection.Resource !== undefined) {
      throw new ProjectionsException("Invalid projected relationship");
    }

    const pk = resource; // TODO better PK

    return match(projection)
      .with({ Type: PROJECTION_TYPES.INDEX }, (r) => ({
        index: `GSI${r.Index}`,
        keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
        expressionNames: {
          "#PK": `GSI${r.Index}-PK`,
          "#SK": `GSI${r.Index}-SK`,
        },
        expressionValues: {
          ":PK": pk,
          ":SKPrefix": `${projectionName}:`,
        },
        reverse,
      }))
      .with({ Type: PROJECTION_TYPES.COMPOSITE }, () => ({
        keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
        expressionNames: {
          "#PK": `PK`,
          "#SK": `SK`,
        },
        expressionValues: {
          ":PK": pk,
          ":SKPrefix": `${projectionName}:${query ?? ""}`,
        },
        reverse,
      }))
      .exhaustive();
  };

  buildRelatedQuery = (projectionName: string, sourceIdentifier: string): Omit<QueryItemArgs, "table"> => {
    const projection = this.Data.Projections.get(projectionName);

    if (projection === undefined || projection.Resource === undefined) {
      throw new ProjectionsException("Invalid projected relationship");
    }

    const pk = buildResourceIdentifier(projection.Resource, sourceIdentifier);

    return match(projection)
      .with({ Type: PROJECTION_TYPES.INDEX }, (r) => ({
        index: `GSI${r.Index}`,
        keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
        expressionNames: {
          "#PK": `GSI${r.Index}-PK`,
          "#SK": `GSI${r.Index}-SK`,
        },
        expressionValues: {
          ":PK": pk,
          ":SKPrefix": `${projectionName}:`,
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
          ":SKPrefix": `${projectionName}:`,
        },
      }))
      .exhaustive();
  };
}
