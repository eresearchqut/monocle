import { ProjectionsService } from "./projections.service";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { GetProjectionsParams, GetProjectionsResponse, PostProjectionsBody } from "./projections.dto";
import { match } from "ts-pattern";
import { PROJECTION_TYPES } from "./projections.constants";

@Controller("/meta/projections")
export class ProjectionsController {
  constructor(private relationshipsService: ProjectionsService) {}

  @Get(":projectionsId")
  async getProjections(@Param() params: GetProjectionsParams): Promise<GetProjectionsResponse> {
    const relationships = await this.relationshipsService.getProjections(params.projectionsId);
    return {
      projections: new Map(
        Array.from(relationships.Data.Projections).map(([key, value]) => [
          key,
          match(value)
            .with({ Type: PROJECTION_TYPES.INDEX }, (r) => ({
              type: r.Type,
              key: r.Key,
              resource: r.Resource,
              index: r.Index,
            }))
            .with({ Type: PROJECTION_TYPES.COMPOSITE }, (r) => ({
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

  @Post("")
  async postProjections(@Body() body: PostProjectionsBody) {
    const result = await this.relationshipsService.createProjections(body.relationships);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create projections", HttpStatus.BAD_REQUEST);
    }
  }
}
