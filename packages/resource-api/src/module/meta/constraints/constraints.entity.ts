import { Equals, IsString, MaxLength, ValidateNested } from "class-validator";
import { ItemEntity } from "../../dynamodb/dynamodb.entity";
import { Type } from "class-transformer";
import { Form } from "@eresearchqut/form-definition";
import { buildResourceConstraint, buildResourceIdentifier, getKeys, validKey } from "../utils";
import { CONSTRAINT_GSI_INDEX } from "./constraints.constants";
import { SYSTEM_USER } from "../constants";
import { KeyError } from "../errors";

export class Constraint {
  @IsString()
  Name!: string;

  @IsString({ each: true })
  Keys!: string[];
}

interface DataType {
  Constraints: Constraint[];
}

export type MetadataConstraintsType = ItemEntity<DataType, "Constraints">;

class MetadataConstraintsData {
  // @MaxLength(12)
  @ValidateNested({ each: true })
  @Type(() => Constraint, {})
  Constraints!: Constraint[];
}

export class MetadataConstraints extends ItemEntity<DataType, "Constraints"> implements MetadataConstraintsType {
  @Equals("Constraints")
  ItemType: "Constraints" = "Constraints";

  @ValidateNested()
  @Type(() => MetadataConstraintsData)
  Data!: MetadataConstraintsData;

  private getKey = (constraint: Constraint, data: Form) => {
    const values = constraint.Keys.map((key) => {
      const keyValues = getKeys(data, key).map((value) => {
        if (validKey(value)) {
          return value;
        } else {
          throw new KeyError(`Invalid key value ${value} for key ${key}`);
        }
      });
      if (keyValues.length === 0) {
        throw new KeyError(`No key values found for key ${key}`);
      } else if (keyValues.length > 1) {
        throw new KeyError(`Multiple keys values found for key ${key}`);
      } else {
        return keyValues[0];
      }
    });
    if (values.length === 0) {
      throw new KeyError(`No keys values found for constraint ${constraint.Name}`);
    }
    return values.join(":");
  };

  private buildConstraintKeyAttributes = (
    resourceName: string,
    sourceId: string,
    constraint: Constraint,
    key: string
  ) => {
    return {
      PK: buildResourceConstraint(resourceName, constraint.Name),
      SK: key,
    };
  };

  private buildConstraintItemAttributes = (
    resourceName: string,
    sourceId: string,
    constraint: Constraint,
    key: string,
    version: number
  ) => {
    return {
      ...this.buildConstraintKeyAttributes(resourceName, sourceId, constraint, key),

      // Note: Do not use to query constraints to be deleted, as the GSI is eventually consistent
      [`GSI${CONSTRAINT_GSI_INDEX}-PK`]: buildResourceIdentifier(resourceName, sourceId),
      [`GSI${CONSTRAINT_GSI_INDEX}-SK`]: `constraint:${constraint.Name}:${key}#version:${version}`,
    };
  };

  buildConstraintItem = (
    resourceName: string,
    sourceId: string,
    constraint: Constraint,
    key: string,
    data: Form,
    version: number
  ): ItemEntity & { ConstraintName: string } => ({
    ...this.buildConstraintItemAttributes(resourceName, sourceId, constraint, key, version),
    Id: sourceId,
    ItemType: "ResourceConstraint",
    CreatedAt: new Date().toISOString(),
    CreatedBy: SYSTEM_USER,
    ConstraintName: constraint.Name,
    Data: data,
  });

  buildConstraintsKeyAttributes = (resourceName: string, sourceId: string, data: Form) =>
    this.Data.Constraints.map((constraint) =>
      this.buildConstraintKeyAttributes(resourceName, sourceId, constraint, this.getKey(constraint, data))
    );

  buildConstraintsItems = (
    resourceName: string,
    sourceId: string,
    data: Form,
    version: number
  ): Map<string, ItemEntity> =>
    new Map(
      this.Data.Constraints.map((constraint) => [
        constraint.Name,
        this.buildConstraintItem(resourceName, sourceId, constraint, this.getKey(constraint, data), data, version),
      ])
    );

  buildConstraintsItemsDiff = (
    resourceName: string,
    sourceId: string,
    oldData: Form,
    newData: Form,
    version: number
  ): { addedConstraints: Map<string, ItemEntity>; removedConstraints: { PK: string; SK: string }[] } =>
    this.Data.Constraints.reduce(
      (acc, constraint) => {
        const oldKey = this.getKey(constraint, oldData);
        const newKey = this.getKey(constraint, newData);

        if (oldKey !== newKey) {
          acc.addedConstraints.set(
            constraint.Name,
            this.buildConstraintItem(resourceName, sourceId, constraint, newKey, newData, version)
          );
          acc.removedConstraints.push(this.buildConstraintKeyAttributes(resourceName, sourceId, constraint, oldKey));
        }

        return acc;
      },
      { addedConstraints: new Map() as Map<string, ItemEntity>, removedConstraints: [] as { PK: string; SK: string }[] }
    );

  hasConstraints = () => this.Data.Constraints.length > 0;
}
