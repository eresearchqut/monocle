import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import {
  GetAuthorizationParams,
  GetAuthorizationResponse,
  GetFormParams,
  GetFormResponse,
  GetMetadataParams,
  GetMetadataQuery,
  GetMetadataResponse,
  PostMetadataBody,
  PostMetadataParams,
  PostMetadataQuery,
  PutAuthorizationBody,
  PutFormBody,
  PutMetadataParams,
  PutMetadataResponse,
} from "./metadata.dto";
import { VersionedErrorInterceptor } from "../../interceptor/dynamodb.interceptor";

@Controller("/metadata")
export class MetadataController {
  public constructor(private metadataService: MetadataService) {}

  @Get("/resource/:resource")
  async getMetadata(
    @Param() params: GetMetadataParams,
    @Query() query: GetMetadataQuery
  ): Promise<GetMetadataResponse> {
    const metadata = await this.metadataService.getMetadata(params.resource, query.version);
    return {
      version: metadata.Data.Version,
      groups: Object.fromEntries(metadata.Data.Groups),
      relationships: Object.fromEntries(metadata.Data.Relationships),
    };
  }

  @Put("/resource/:resource")
  @UseInterceptors(VersionedErrorInterceptor)
  async putMetadata(@Param() params: PutMetadataParams): Promise<PutMetadataResponse> {
    return { created: await this.metadataService.addMetadata(params.resource) };
  }

  @Post("/resource/:resource")
  async postMetaData(
    @Param() params: PostMetadataParams,
    @Query() query: PostMetadataQuery,
    @Body() body: PostMetadataBody
  ) {
    const data = {
      resource: params.resource,
      version: body.version,
      groups: body.groups,
      relationships: body.relationships,
    };

    if (query?.validation === "validate") {
      return this.metadataService.pushMetadataVersion(data, "validate");
    } else {
      return this.metadataService.pushMetadataVersion(data, "none");
    }
  }

  @Get("/form/:formId")
  async getForm(@Param() params: GetFormParams): Promise<GetFormResponse> {
    const form = await this.metadataService.getForm(params.formId);
    const schema = await form.getSchema();
    return {
      form: form.Data.Definition,
      schema: schema,
    };
  }

  @Put("/form")
  async putForm(@Body() body: PutFormBody) {
    const result = await this.metadataService.putForm(body.definition);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create form", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("/form/:authorizationId")
  async getAuthorization(@Param() params: GetAuthorizationParams): Promise<GetAuthorizationResponse> {
    const authorization = await this.metadataService.getAuthorization(params.authorizationId);
    return {
      policy: authorization.Data.Policy,
    };
  }

  @Put("/authorization")
  async putAuthorization(@Body() body: PutAuthorizationBody) {
    return { created: await this.metadataService.putAuthorization(body.policy) };
  }
}
