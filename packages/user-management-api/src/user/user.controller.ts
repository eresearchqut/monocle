import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':userPoolId')
  public list(
    @Param('userPoolId') userPoolId: string,
  ): Promise<Array<User>> {
    return this.userService.list(userPoolId);
  }
}
