import { FormService } from "./form.service";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Put } from "@nestjs/common";
import { GetFormParams, GetFormResponse, PutFormBody } from "./form.dto";

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

  @Put("")
  async putForm(@Body() body: PutFormBody) {
    const result = await this.formService.putForm(body.definition);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create form", HttpStatus.BAD_REQUEST);
    }
  }
}