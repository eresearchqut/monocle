import { Equals, IsBoolean, IsISO8601, IsObject, IsString, ValidateNested } from "class-validator";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import Ajv from "ajv";

export type MetaDataFormType = ItemEntity<
  {
    Schema: string;
  },
  "Form"
>;

class MetadataFormData {
  @IsString()
  Schema: string;
}

export class MetadataForm implements MetaDataFormType {
  @IsString()
  Id: string;

  @IsString()
  PK: string;

  @IsString()
  SK?: string;

  @Equals("Form")
  ItemType: "Form" = "Form";

  @IsISO8601()
  CreatedAt: string;

  @IsString()
  CreatedBy: string;

  @ValidateNested()
  Data: MetadataFormData;

  validate = (data: any) => {
    const ajv = new Ajv();
    const schema = JSON.parse(this.Data.Schema);
    const validate = ajv.compile(schema);
    validate(data);
    return validate.errors;
  };

  getSchema = () => {
    return JSON.parse(this.Data.Schema);
  };

  // TODO: Add form compiler output
  compiled = () => ({});
}
