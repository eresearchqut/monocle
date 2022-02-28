import { ProjectionsService } from "./projections.service";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { GetProjectionsParams, GetProjectionsResponse, PostProjectionsBody } from "./projections.dto";
import { match } from "ts-pattern";
import { PROJECTION_TYPES } from "./projections.constants";

@Controller("/meta/projections")
export class ProjectionsController {
  constructor(private projectionsService: ProjectionsService) {}

  @Get(":projectionsId")
  async getProjections(@Param() params: GetProjectionsParams): Promise<GetProjectionsResponse> {
    const projections = await this.projectionsService.getProjections(params.projectionsId);
    return {
      projections: new Map(
        Array.from(projections.Data.Projections).map(([key, value]) => [
          key,
          match(value)
            .with({ ProjectionType: PROJECTION_TYPES.INDEX }, (r) => ({
              projectionType: r.ProjectionType,
              partitionType: r.PartitionType,
              key: r.Key,
              resource: r.Resource,
              index: r.Index,
            }))
            .with({ ProjectionType: PROJECTION_TYPES.COMPOSITE }, (r) => ({
              projectionType: r.ProjectionType,
              partitionType: r.PartitionType,
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
    const result = await this.projectionsService.createProjections(body.projections);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create projections", HttpStatus.BAD_REQUEST);
    }
  }
}
