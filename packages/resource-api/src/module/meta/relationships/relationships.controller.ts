import { RelationshipsService } from "./relationships.service";
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { GetRelationshipsParams, GetRelationshipsResponse, PostRelationshipsBody } from "./relationships.dto";

@Controller("/meta/relationships")
export class RelationshipsController {
  constructor(private relationshipsService: RelationshipsService) {}

  @Get(":relationshipsId")
  async getRelationships(@Param() params: GetRelationshipsParams): Promise<GetRelationshipsResponse> {
    return this.relationshipsService.getRelationships(params.relationshipsId).then((relationships) => ({
      relationships: new Map(
        Array.from(relationships.Data.Relationships).map(([key, value]) => [
          key,
          {
            key: value.Key,
            resource: value.Resource,
            dataKey: value.DataKey,
          },
        ])
      ),
    }));
  }

  @Post("")
  async postRelationships(@Body() body: PostRelationshipsBody) {
    const result = await this.relationshipsService.createRelationships(body.relationships);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Failed to create relationships", HttpStatus.BAD_REQUEST);
    }
  }
}
