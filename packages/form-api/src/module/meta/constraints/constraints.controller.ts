import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { ConstraintsService } from "./constraints.service";
import { GetConstraintsParams, GetConstraintsResponse, PostConstraintsBody } from "./constraints.dto";

@Controller("/meta/constraints")
export class ConstraintsController {
  constructor(private constraintsService: ConstraintsService) {}

  @Get(":constraintsId")
  async getConstraints(@Param() params: GetConstraintsParams): Promise<GetConstraintsResponse> {
    return this.constraintsService.getConstraints(params.constraintsId).then((constraints) => ({
      constraints: constraints.Data.Constraints.map((constraint) => ({
        name: constraint.Name,
        keys: constraint.Keys,
      })),
    }));
  }

  @Post("")
  async postConstraints(@Body() body: PostConstraintsBody) {
    const result = await this.constraintsService.createConstraints(body.constraints);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Failed to create constraints", HttpStatus.BAD_REQUEST);
    }
  }
}
