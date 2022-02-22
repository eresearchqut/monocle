import { Module } from "@nestjs/common";
import { ProjectionsService } from "./projections.service";
import { ProjectionsController } from "./projections.controller";
import { DynamodbModule } from "../../dynamodb/dynamodb.module";

@Module({
  providers: [ProjectionsService],
  exports: [ProjectionsService],
  imports: [DynamodbModule],
  controllers: [ProjectionsController],
})
export class ProjectionsModule {}
