import { Controller, Get, Query } from "@nestjs/common";
import { AppService } from "./app.service";
import { HelloQuery } from "./app.dto";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Query() query: HelloQuery): string {
    return this.appService.getHello(query.name ?? "world");
  }
}
