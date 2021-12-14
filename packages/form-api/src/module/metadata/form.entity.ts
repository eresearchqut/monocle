import { Equals, IsISO8601, IsString, IsUUID, ValidateNested } from "class-validator";
import { ItemEntity } from "../dynamodb/dynamodb.entity";
import Ajv from "ajv";
import { findFormCompiler } from "@eresearchqut/form-compiler";

export type MetaDataFormType = ItemEntity<
  {
    Definition: string;
  },
  "Form"
>;

class MetadataFormData {
  @IsString()
  Definition: string;
}

export class MetadataForm implements MetaDataFormType {
  @IsUUID()
  Id: string;

  @IsString()
  PK: string;

  @IsString()
  SK: string;

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
    const schema = this.getSchema();
    if (!schema) throw new Error("Schema not compiled");

    const validate = ajv.compile(schema);
    validate(data);
    return validate.errors;
  };

  getSchema = () => {
    const definition = JSON.parse(this.Data.Definition);
    const compiler = findFormCompiler(definition);
    if (compiler === undefined) throw new Error("No compiler found");

    const schema = compiler.schema(definition);
    if (schema === undefined) throw new Error("Schema not compiled");

    return schema;
  };
}
