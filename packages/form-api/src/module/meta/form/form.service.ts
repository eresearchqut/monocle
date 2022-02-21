import { Injectable } from "@nestjs/common";
import { ConditionallyValidateClassAsync } from "../../../decorator/validate.decorator";
import { TransformPlainToClass } from "class-transformer";
import { MetadataForm, MetaDataFormType } from "./form.entity";
import { NIL as NIL_UUID, v4 as uuidV4 } from "uuid";
import { Form, Section } from "@eresearchqut/form-definition";
import { SYSTEM_USER } from "../constants";
import { DynamodbRepository } from "../../dynamodb/dynamodb.repository";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../../app.config";
import { FormException } from "./form.exception";

function buildFormItemKey(id: string) {
  const key = `Form:${id}`;
  return { PK: key, SK: key };
}

const EMPTY_FORM: MetaDataFormType = {
  ...buildFormItemKey(NIL_UUID),
  Id: NIL_UUID,
  ItemType: "Form",
  CreatedAt: new Date().toISOString(),
  CreatedBy: SYSTEM_USER,
  Data: {
    Definition: {
      name: "",
      sections: [] as Section[],
    },
  },
} as const;

@Injectable()
export class FormService {
  constructor(public configService: ConfigService<AppConfig, true>, private dynamodbService: DynamodbRepository) {}

  @ConditionallyValidateClassAsync("VALIDATE_METADATA_ON_READ")
  @TransformPlainToClass(MetadataForm)
  public async getForm(id: string): Promise<MetadataForm> {
    if (id === NIL_UUID) {
      // Must cast to MetadataForm because transform decorator cannot change method signature
      return EMPTY_FORM as MetadataForm;
    }

    const key = buildFormItemKey(id);

    const item = await this.dynamodbService.getItem<MetadataForm>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });
    if (item === null) {
      throw new FormException(`Failed to retrieve form ${id}`);
    }
    return item;
  }

  public async createForm(definition: Form): Promise<{ created: false }>;
  public async createForm(definition: Form): Promise<{ created: true; id: string }>;
  public async createForm(definition: Form): Promise<{ created: boolean; id?: string }> {
    const id = uuidV4();
    const key = buildFormItemKey(id);
    return this.dynamodbService
      .createItem<MetaDataFormType>({
        table: this.configService.get("RESOURCE_TABLE"),
        item: {
          ...key,
          Id: id,
          ItemType: "Form",
          CreatedAt: new Date().toISOString(),
          CreatedBy: SYSTEM_USER,
          Data: {
            Definition: definition,
          },
        },
      })
      .then(() => ({ created: true, id }))
      .catch((err) => (err.code === "ConditionalCheckFailed" ? { created: false } : Promise.reject(err)));
  }
}
