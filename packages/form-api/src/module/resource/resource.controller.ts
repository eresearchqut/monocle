import { Body, Controller, Delete, Get, HttpException, Param, Post, Put, Query } from "@nestjs/common";
import {
  DeleteResourceQuery,
  DeleteResourceParams,
  GetResourceQuery,
  GetResourceParams,
  PostResourceQuery,
  PostResourceParams,
  PutResourceQuery,
  PutResourceParams,
  PutResourceBody,
  PostResourceBody,
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

  @Put(":resource")
  public async putResource(
    @Param() params: PutResourceParams,
    @Query() query: PutResourceQuery,
    @Body() body: PutResourceBody
  ) {
    return await this.resourceService.putResource({
      resource: params.resource,
      version: params.version,
      options: query.options,
      data: body.data,
    });
  }

  @Post(":resource/:id")
  public async postResource(
    @Param() params: PostResourceParams,
    @Query() query: PostResourceQuery,
    @Body() body: PostResourceBody
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
}
