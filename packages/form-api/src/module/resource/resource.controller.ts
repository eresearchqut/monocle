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
} from "./resource.dto";
import { ResourceService } from "./resource.service";

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
      resource: {
        name: params.resource,
        version: query.version,
      },
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
      resource: {
        name: params.resource,
        version: query.version,
      },
      id: params.id,
      version: body.version,
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

  @Get(":resource/:id/:relationship/:targetResource")
  public async queryRelated(@Param() params: QueryRelatedResourceParams) {
    const results = this.resourceService.queryRelatedResources({
      resource: params.resource,
      id: params.id,
      targetResource: params.targetResource,
      relationship: params.relationship,
    });

    // TODO: streaming & pagination options
    const resources = [];
    for await (const resource of results) {
      resources.push(resource);
    }

    return resources;
  }
}
