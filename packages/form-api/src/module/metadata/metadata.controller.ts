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
  GetRelationshipsParams,
  GetRelationshipsResponse,
  PostMetadataBody,
  PostMetadataParams,
  PostMetadataQuery,
  PutAuthorizationBody,
  PutFormBody,
  PutMetadataParams,
  PutMetadataResponse,
  PutRelationshipsBody,
} from "./metadata.dto";
import { VersionedErrorInterceptor } from "../../interceptor/dynamodb.interceptor";
import { FormService } from "./form.service";
import { AuthorizationService } from "./authorization.service";
import { RelationshipsService } from "./relationships.service";
import { match } from "ts-pattern";
import { RELATIONSHIP_TYPES } from "./constants";

@Controller("/metadata")
export class MetadataController {
  public constructor(
    private metadataService: MetadataService,
    private formService: FormService,
    private authorizationService: AuthorizationService,
    private relationshipsService: RelationshipsService
  ) {}

  @Get("/resource/:resource")
  async getMetadata(
    @Param() params: GetMetadataParams,
    @Query() query: GetMetadataQuery
  ): Promise<GetMetadataResponse> {
    const metadata = await this.metadataService.getMetadata(params.resource, query.version);
    return {
      version: metadata.Data.Version,
      schemas: {
        formVersion: metadata.Data.Schemas.FormVersion,
        authorizationVersion: metadata.Data.Schemas.AuthorizationVersion,
        relationshipsVersion: metadata.Data.Schemas.RelationshipsVersion,
      },
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
      schemas: body.schemas,
    };

    if (query?.validation === "validate") {
      return this.metadataService.pushMetadataVersion(data, "validate");
    } else {
      return this.metadataService.pushMetadataVersion(data, "none");
    }
  }

  @Get("/form/:formId")
  async getForm(@Param() params: GetFormParams): Promise<GetFormResponse> {
    const form = await this.formService.getForm(params.formId);
    const schema = await form.getSchema();
    return {
      form: form.Data.Definition,
      schema: schema,
    };
  }

  @Put("/form")
  async putForm(@Body() body: PutFormBody) {
    const result = await this.formService.putForm(body.definition);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create form", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("/authorization/:authorizationId")
  async getAuthorization(@Param() params: GetAuthorizationParams): Promise<GetAuthorizationResponse> {
    const authorization = await this.authorizationService.getAuthorization(params.authorizationId);
    return {
      policy: authorization.Data.Policy,
    };
  }

  @Put("/authorization")
  async putAuthorization(@Body() body: PutAuthorizationBody) {
    const result = await this.authorizationService.putAuthorization(body.policy);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create authorization policy", HttpStatus.BAD_REQUEST);
    }
  }

  @Get("/relationships/:relationshipsId")
  async getRelationships(@Param() params: GetRelationshipsParams): Promise<GetRelationshipsResponse> {
    const relationships = await this.relationshipsService.getRelationships(params.relationshipsId);
    return {
      relationships: new Map(
        Array.from(relationships.Data.Relationships).map(([key, value]) => [
          key,
          match(value)
            .with({ Type: RELATIONSHIP_TYPES.INDEX }, (r) => ({
              type: r.Type,
              key: r.Key,
              resource: r.Resource,
              index: r.Index,
            }))
            .with({ Type: RELATIONSHIP_TYPES.COMPOSITE }, (r) => ({
              type: r.Type,
              key: r.Key,
              resource: r.Resource,
              dataKey: r.DataKey,
            }))
            .exhaustive(),
        ])
      ),
    };
  }

  @Put("/relationships")
  async putRelationships(@Body() body: PutRelationshipsBody) {
    const result = await this.relationshipsService.putRelationships(body.relationships);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create relationships", HttpStatus.BAD_REQUEST);
    }
  }
}
