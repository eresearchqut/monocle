import { RelationshipsService } from "./relationships.service";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Put } from "@nestjs/common";
import { GetRelationshipsParams, GetRelationshipsResponse, PutRelationshipsBody } from "./relationships.dto";
import { match } from "ts-pattern";
import { RELATIONSHIP_TYPES } from "./relationships.constants";

@Controller("/meta/relationships")
export class RelationshipsController {
  constructor(private relationshipsService: RelationshipsService) {}

  @Get(":relationshipsId")
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

  @Put("")
  async putRelationships(@Body() body: PutRelationshipsBody) {
    const result = await this.relationshipsService.putRelationships(body.relationships);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create relationships", HttpStatus.BAD_REQUEST);
    }
  }
}
