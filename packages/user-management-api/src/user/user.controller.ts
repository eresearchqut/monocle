import {Controller, Get, Query} from '@nestjs/common';
import {UserService} from './user.service';
import {Page, User} from './user.interface';

@Controller('user')
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
}
