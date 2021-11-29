import { Controller, Get, Param, Query } from "@nestjs/common";
import { OldResourceService } from "./oldResource.service";
import { ResourceTypeNames } from "./oldResource.resource";
import { IsString } from "class-validator";

class GetResourceParams {
  @IsString()
  resource: ResourceTypeNames;
}

@Controller("/oldResource")
export class OldResourceController {
  public constructor(private entityService: OldResourceService) {}

  @Get(":oldResource")
  async getResource(@Param() params: GetResourceParams, @Query() data: any) {
    return this.entityService.getResource(params.resource, data);
  }
}
