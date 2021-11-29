import { Module } from "@nestjs/common";
import { OldResourceController } from "./oldResourceController";
import { OldResourceService } from "./oldResource.service";

@Module({
  controllers: [OldResourceController],
  providers: [OldResourceService],
})
export class OldResourceModule {}
