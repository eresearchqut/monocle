import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../../app.config";
import { DynamodbRepository } from "../../dynamodb/dynamodb.repository";
import { MetadataAuthorization, MetadataAuthorizationType } from "./authorization.entity";
import { NIL as NIL_UUID, v4 as uuidV4 } from "uuid";
import { SYSTEM_USER } from "../constants";
import { ConditionallyValidateClassAsync } from "../../../decorator/validate.decorator";
import { TransformPlainToClass } from "class-transformer";
import { AuthorizationException } from "./authorization.exception";

export function buildAuthorizationItemKey(id: string) {
  const key = `Authorization:${id}`;
  return { PK: key, SK: key };
}

export const EMPTY_AUTHORIZATION: MetadataAuthorizationType = {
  ...buildAuthorizationItemKey(NIL_UUID),
  Id: NIL_UUID,
  ItemType: "Authorization",
  CreatedAt: new Date().toISOString(),
  CreatedBy: SYSTEM_USER,
  Data: {
    Policy: "",
  },
} as const;

@Injectable()
export class AuthorizationService {
  constructor(public configService: ConfigService<AppConfig, true>, private dynamodbService: DynamodbRepository) {}

  @ConditionallyValidateClassAsync("VALIDATE_METADATA_ON_READ")
  @TransformPlainToClass(MetadataAuthorization)
  public async getAuthorization(id: string): Promise<MetadataAuthorization> {
    if (id === NIL_UUID) {
      // Must cast to MetadataAuthorization because transform decorator cannot change method signature
      return EMPTY_AUTHORIZATION as MetadataAuthorization;
    }

    const key = buildAuthorizationItemKey(id);

    const item = await this.dynamodbService.getItem<MetadataAuthorization>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });
    if (item === null) {
      throw new AuthorizationException(`Failed to retrieve authorization policy for resource ${id}`);
    }
    return item;
  }

  public async createAuthorization(policy: string): Promise<{ created: false }>;
  public async createAuthorization(policy: string): Promise<{ created: true; id: string }>;
  public async createAuthorization(policy: string): Promise<{ created: boolean; id?: string }> {
    const id = uuidV4();
    const key = buildAuthorizationItemKey(id);
    return this.dynamodbService
      .createItem<MetadataAuthorizationType>({
        table: this.configService.get("RESOURCE_TABLE"),
        item: {
          ...key,
          Id: id,
          ItemType: "Authorization",
          CreatedAt: new Date().toISOString(),
          CreatedBy: SYSTEM_USER,
          Data: {
            Policy: policy,
          },
        },
      })
      .then(() => ({ created: true, id }))
      .catch((err) => (err.code === "ConditionalCheckFailed" ? { created: false } : Promise.reject(err)));
  }
}
