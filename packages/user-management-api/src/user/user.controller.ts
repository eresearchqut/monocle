import {Controller, Get, Query, Param, UseFilters, UseInterceptors} from '@nestjs/common';
import {UserService} from './user.service';
import {Page, User} from './user.interface';
import {CognitoErrorInterceptor} from '../cognito/cognito.interceptor'


@Controller('user')
@UseInterceptors(new CognitoErrorInterceptor())
export class UserController {
    constructor(private readonly userService: UserService) {
    }

    @Get("/")
    public list(
        @Query('limit') limit: string,
        @Query('filter') filter: string,
        @Query('startPageToken') startPageToken: string,
    ): Promise<Page<User>> {
        return this.userService.listUsers(Number.parseInt(limit), filter, startPageToken);
    }

    @Get("/:username")
    public get(
        @Param('username') username: string,
    ): Promise<User> {
        return this.userService.getUser(username);
    }

    @Get("/estimatedNumberOfUsers")
    public estimatedUserCount(
    ): Promise<number> {
        return this.userService.estimatedNumberOfUsers();
    }
}
