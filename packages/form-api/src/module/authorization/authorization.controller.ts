import { Body, Controller, Get, HttpException, HttpStatus, Param, Put } from "@nestjs/common";
import { GetAuthorizationParams, GetAuthorizationResponse, PutAuthorizationBody } from "./authorization.dto";
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

  @Put("/authorization")
  async putAuthorization(@Body() body: PutAuthorizationBody) {
    const result = await this.authorizationService.putAuthorization(body.policy);
    if (result.created) {
      return result;
    } else {
      throw new HttpException("Fail to create authorization policy", HttpStatus.BAD_REQUEST);
    }
  }
}
