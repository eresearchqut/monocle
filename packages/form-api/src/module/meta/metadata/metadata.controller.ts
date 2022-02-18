import { Body, Controller, Get, Param, Post, Put, Query, UseInterceptors } from "@nestjs/common";
import { MetadataService } from "./metadata.service";
import {
  GetMetadataParams,
  GetMetadataQuery,
  GetMetadataResponse,
  PostMetadataBody,
  PostMetadataParams,
  PostMetadataQuery,
  PutMetadataParams,
  PutMetadataResponse,
} from "./metadata.dto";
import { VersionedErrorInterceptor } from "../../../interceptor/dynamodb.interceptor";

@Controller("/meta/metadata")
export class MetadataController {
  public constructor(private metadataService: MetadataService) {}

  @Get(":resource")
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

  @Put(":resource")
  @UseInterceptors(VersionedErrorInterceptor)
  async putMetadata(@Param() params: PutMetadataParams): Promise<PutMetadataResponse> {
    return { created: await this.metadataService.addMetadata(params.resource) };
  }

  @Post(":resource")
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
}
