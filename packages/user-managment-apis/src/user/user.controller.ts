import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserType } from '@aws-sdk/client-cognito-identity-provider';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userPoolId')
  public list(
    @Param('userPoolId') userPoolId: string,
  ): Promise<Array<UserType>> {
    return this.userService.list(userPoolId);
  }
}
