import {Controller, Get, Query, UseFilters, UseInterceptors} from '@nestjs/common';
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
        return this.userService.list(Number.parseInt(limit), filter, startPageToken);
    }

    @Get("/estimatedNumberOfUsers")
    public estimatedUserCount(
    ): Promise<number> {
        return this.userService.estimatedNumberOfUsers();
    }
}
