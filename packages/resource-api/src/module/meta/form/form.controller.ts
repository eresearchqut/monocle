import { FormService } from "./form.service";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { GetFormParams, GetFormResponse, PostFormBody } from "./form.dto";

@Controller("/meta/form")
export class FormController {
  public constructor(private formService: FormService) {}

  @Get(":formId")
  async getForm(@Param() params: GetFormParams): Promise<GetFormResponse> {
    const form = await this.formService.getForm(params.formId);
    const schema = await form.getSchema();
    return {
      form: form.Data.Definition,
      schema: schema,
    };
  }

  @Post("")
  async postForm(@Body() body: PostFormBody) {
    const result = await this.formService.createForm(body.definition);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Failed to create form", HttpStatus.BAD_REQUEST);
    }
  }
}
