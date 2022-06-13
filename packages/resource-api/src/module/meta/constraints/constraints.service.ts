import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../../app.config";
import { DynamodbService } from "../../dynamodb/dynamodb.service";
import { MetadataConstraints, MetadataConstraintsType } from "./constraints.entity";
import { NIL as NIL_UUID, v4 as uuidV4 } from "uuid";
import { SYSTEM_USER } from "../constants";
import { TransformPlainToClass } from "class-transformer";
import { ConditionallyValidateClassAsync } from "../../../decorator/validate.decorator";
import { ConstraintsException } from "./constraints.exception";

type PutConstraintsInput = { name: string; keys: string[] }[];

export function buildConstraintsItemKey(id: string) {
  const key = `Constraints:${id}`;
  return { PK: key, SK: key };
}

export const EMPTY_CONSTRAINTS: MetadataConstraintsType = {
  ...buildConstraintsItemKey(NIL_UUID),
  Id: NIL_UUID,
  ItemType: "Constraints",
  CreatedAt: new Date().toISOString(),
  CreatedBy: SYSTEM_USER,
  Data: {
    Constraints: [],
  },
};

@Injectable()
export class ConstraintsService {
  constructor(public configService: ConfigService<AppConfig, true>, private dynamodbService: DynamodbService) {}

  @ConditionallyValidateClassAsync("VALIDATE_METADATA_ON_READ")
  @TransformPlainToClass(MetadataConstraints)
  public async getConstraints(id: string): Promise<MetadataConstraints> {
    if (id === NIL_UUID) {
      // Must cast to MetadataConstraints because transform decorator cannot change method signature
      return EMPTY_CONSTRAINTS as MetadataConstraints;
    }

    const key = buildConstraintsItemKey(id);

    const item = await this.dynamodbService.getItem<MetadataConstraints>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });

    if (item === null) {
      throw new ConstraintsException(`Failed to retrieve constraints for resource ${id}`);
    }

    return item;
  }

  public async createConstraints(constraints: PutConstraintsInput): Promise<{ created: false }>;
  public async createConstraints(constraints: PutConstraintsInput): Promise<{ created: true; id: string }>;
  public async createConstraints(constraints: PutConstraintsInput): Promise<{ created: boolean; id?: string }> {
    const id = uuidV4();
    const key = buildConstraintsItemKey(id);

    return this.dynamodbService
      .createItem<MetadataConstraintsType>({
        table: this.configService.get("RESOURCE_TABLE"),
        item: {
          ...key,
          Id: id,
          ItemType: "Constraints",
          CreatedAt: new Date().toISOString(),
          CreatedBy: SYSTEM_USER,
          Data: {
            Constraints: constraints.map((constraint) => ({
              Name: constraint.name,
              Keys: constraint.keys,
            })),
          },
        },
      })
      .then(() => ({ created: true, id }))
      .catch((err) => (err.code === "ConditionalCheckFailed" ? { created: false } : Promise.reject(err)));
  }
}
