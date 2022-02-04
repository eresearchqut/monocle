import { Injectable } from "@nestjs/common";
import { ConditionallyValidateClassAsync } from "../../decorator/validate.decorator";
import { TransformPlainToClass } from "class-transformer";
import { MetadataForm, MetaDataFormType } from "./form.entity";
import { NIL as NIL_UUID, v4 as uuidV4 } from "uuid";
import { MetadataException } from "./metadata.exception";
import { Form, Section } from "@eresearchqut/form-definition";
import { SYSTEM_USER } from "./constants";
import { DynamodbRepository } from "../dynamodb/dynamodb.repository";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../app.config";

function buildFormItemKey(form: string) {
  const key = `Form:${form}`;
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
  public async getForm(form: string): Promise<MetadataForm> {
    if (form === NIL_UUID) {
      // Must cast to MetadataForm because transform decorator cannot change method signature
      return EMPTY_FORM as MetadataForm;
    }

    const key = buildFormItemKey(form);

    const item = await this.dynamodbService.getItem<MetadataForm>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });
    if (item === null) {
      throw new MetadataException(`Failed to retrieve form ${form}`);
    }
    return item;
  }

  public async putForm(definition: Form): Promise<{ created: false }>;
  public async putForm(definition: Form): Promise<{ created: true; id: string }>;
  public async putForm(definition: Form): Promise<{ created: boolean; id?: string }> {
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