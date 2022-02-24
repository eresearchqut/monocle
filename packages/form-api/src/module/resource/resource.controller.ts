import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, Query } from "@nestjs/common";
import {
  DeleteResourceParams,
  DeleteResourceQuery,
  GetResourceParams,
  GetResourceQuery,
  PostResourceBody,
  PostResourceParams,
  PostResourceQuery,
  PutResourceBody,
  PutResourceParams,
  PutResourceQuery,
  QueryRelatedResourceParams,
  QueryResourceParams,
  QueryResourceProjectionParams,
  QueryResourceProjectionQuery,
  QueryType,
} from "./resource.dto";
import { ResourceService } from "./resource.service";
import { __, match } from "ts-pattern";

// TODO: Consider stripping non-Data keys from responses for security reasons

@Controller("/resource")
export class ResourceController {
  public constructor(private resourceService: ResourceService) {}

  @Get(":resource/:id")
  public async getResource(@Param() params: GetResourceParams, @Query() query: GetResourceQuery) {
    const resource = await this.resourceService.getResource({
      resource: params.resource,
      id: params.id,
      options: query.options,
    });
    if (resource === null) {
      throw new HttpException("Resource not found", 404);
    }
    return resource;
  }

  @Post(":resource")
  public async postResource(
    @Param() params: PostResourceParams,
    @Query() query: PostResourceQuery,
    @Body() body: PostResourceBody
  ) {
    return await this.resourceService.putResource({
      resource: params.resource,
      version: params.version,
      options: query.options,
      data: body.data,
    });
  }

  @Put(":resource/:id")
  public async putResource(
    @Param() params: PutResourceParams,
    @Query() query: PutResourceQuery,
    @Body() body: PutResourceBody
  ) {
    return await this.resourceService.putResource({
      resource: params.resource,
      id: params.id,
      version: params.version,
      options: query.options,
      data: body.data,
    });
  }

  @Delete(":resource/:id")
  public async deleteResource(@Param() params: DeleteResourceParams, @Query() query: DeleteResourceQuery) {
    return await this.resourceService.deleteResource({
      resource: params.resource,
      id: params.id,
      options: query.options,
    });
  }

  @Get(":resource")
  public async queryResources(@Param() params: QueryResourceParams) {
    const query = await this.resourceService.queryResources({
      resource: params.resource,
    });

    const resources = [];
    for await (const resource of query) {
      resources.push(resource);
    }

    return resources;
  }

  @Get(":resource/projection/:projection")
  public async queryProjection(
    @Param() params: QueryResourceProjectionParams,
    @Query() query: QueryResourceProjectionQuery
  ) {
    const queryValue = match(query)
      .with({ query: __.string, queryType: QueryType.STRING }, (q) => q.query)
      .with({ query: __.string, queryType: QueryType.NUMBER }, (q) => parseInt(q.query))
      .with({ query: __.string, queryType: QueryType.BOOLEAN }, (q) => q.query === "true")
      .otherwise(() => undefined);

    const results = this.resourceService.queryResourceProjection({
      resource: params.resource,
      projection: params.projection,
      reverse: query.order === "reverse",
      query: queryValue,
    });

    // TODO: streaming & pagination options
    const resources = [];
    for await (const resource of results) {
      resources.push(resource);
    }

    return resources;
  }

  @Get(":resource/:id/:projection/:targetResource")
  public async queryRelated(@Param() params: QueryRelatedResourceParams) {
    const results = this.resourceService.queryRelatedResources({
      resource: params.resource,
      id: params.id,
      targetResource: params.targetResource,
      projection: params.projection,
    });

    // TODO: streaming & pagination options
    const resources = [];
    for await (const resource of results) {
      resources.push(resource);
    }

    return resources;
  }
}
