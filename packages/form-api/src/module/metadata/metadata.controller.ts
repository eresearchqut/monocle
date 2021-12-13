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
import { TransformPlainToClass } from "class-transformer";
import { VersionedErrorInterceptor } from "../../interceptor/dynamodb.interceptor";

@Controller("/metadata")
export class MetadataController {
  public constructor(private metadataService: MetadataService) {}

  @Get("/resource/:resource")
  @TransformPlainToClass(GetMetadataResponse)
  async getMetadata(
    @Param() params: GetMetadataParams,
    @Query() query: GetMetadataQuery
  ): Promise<GetMetadataResponse> {
    const metadata = await this.metadataService.getMetadata(params.resource, query.version);
    const groupData = await Promise.all(
      Object.entries(metadata.Data.Groups).map(async ([key, value]) => {
        const [form, authorization] = await Promise.all([
          this.metadataService.getForm(value.formVersion).then(({ Data }) => JSON.parse(Data.Schema)),
          this.metadataService.getAuthorization(value.authorizationVersion).then(({ Data }) => Data.Policy),
        ]);
        return [
          key,
          {
            form,
            authorization,
          },
        ];
      })
    );
    return {
      version: metadata.Data.Version,
      groups: Object.fromEntries(groupData),
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
    };

    if (query?.validation === "validate") {
      return this.metadataService.pushMetadataVersion(data, "validate");
    } else {
      return this.metadataService.pushMetadataVersion(data, "none");
    }
  }

  @Put("/form")
  async putForm(@Body() body: PutFormBody) {
    const result = await this.metadataService.putForm(body.schema);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create form", HttpStatus.BAD_REQUEST);
    }
  }

  @Put("/authorization")
  async putAuthorization(@Body() body: PutAuthorizationBody) {
    return { created: await this.metadataService.putAuthorization(body.policy) };
  }
}
