import { IsObject, IsUUID } from "class-validator";
import { IsJsonSchema } from "../../../decorator/validate.decorator";
import { form as FormSchema } from "@eresearchqut/form-definition/dist/schema";
import { Form } from "@eresearchqut/form-definition";

export class GetFormParams {
  @IsUUID()
  formId!: string;
}

export class GetFormResponse {
  @IsObject()
  form: any;

  @IsObject()
  schema: any;
}

export class PutFormBody {
  @IsJsonSchema(FormSchema, {
    allowUnionTypes: true,
  })
  definition!: Form;
}
