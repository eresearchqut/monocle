import { IsObject, IsUUID } from "class-validator";
import { IsJsonSchema } from "../../../decorator/validate.decorator";
import { form as FormSchema } from "@eresearchqut/form-definition/dist/schema";
import { Form } from "@eresearchqut/form-definition";
import { ApiProperty } from "@nestjs/swagger";

export class GetFormParams {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  formId!: string;
}

export class GetFormResponse {
  @IsObject()
  form: any;

  @IsObject()
  schema: any;
}

export class PostFormBody {
  @ApiProperty(FormSchema)
  @IsJsonSchema(FormSchema, {
    allowUnionTypes: true,
  })
  definition!: Form;
}
