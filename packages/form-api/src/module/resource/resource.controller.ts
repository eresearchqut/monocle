import { Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import {
  DeleteResourceData,
  DeleteResourceParams,
  GetResourceData,
  GetResourceParams,
  PostResourceData,
  PostResourceParams,
  PutResourceData,
  PutResourceParams,
} from "./resource.dto";
import { ResourceService } from "./resource.service";

@Controller("/resource")
export class ResourceController {
  public constructor(private resourceService: ResourceService) {}

  @Get(":resource/:id")
  public async getResource(@Param() params: GetResourceParams, @Query() data: GetResourceData) {
    return await this.resourceService.getResource({
      resource: params.resource,
      id: params.id,
      options: data.options,
    });
  }

  @Put(":resource")
  public async putResource(@Param() params: PutResourceParams, @Query() data: PutResourceData) {
    await this.resourceService.putResource({
      resource: params.resource,
      version: params.version,
      data: data.data,
      options: data.options,
    });
  }

  @Post(":resource/:id")
  public async postResource(@Param() params: PostResourceParams, @Query() data: PostResourceData) {
    await this.resourceService.putResource({
      resource: params.resource,
      id: params.id,
      version: params.version,
      data: data.data,
      options: data.options,
    });
  }

  @Delete(":resource/:id")
  public async deleteResource(@Param() params: DeleteResourceParams, @Query() data: DeleteResourceData) {
    return await this.resourceService.deleteResource({
      resource: params.resource,
      id: params.id,
      options: data.options,
    });
  }
}
