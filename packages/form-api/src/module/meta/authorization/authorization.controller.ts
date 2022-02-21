import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from "@nestjs/common";
import { GetAuthorizationParams, GetAuthorizationResponse, PostAuthorizationBody } from "./authorization.dto";
import { AuthorizationService } from "./authorization.service";

@Controller("/meta/authorization")
export class AuthorizationController {
  constructor(private authorizationService: AuthorizationService) {}

  @Get("/authorization/:authorizationId")
  async getAuthorization(@Param() params: GetAuthorizationParams): Promise<GetAuthorizationResponse> {
    const authorization = await this.authorizationService.getAuthorization(params.authorizationId);
    return {
      policy: authorization.Data.Policy,
    };
  }

  @Post("/authorization")
  async postAuthorization(@Body() body: PostAuthorizationBody) {
    const result = await this.authorizationService.createAuthorization(body.policy);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create authorization policy", HttpStatus.BAD_REQUEST);
    }
  }
}
