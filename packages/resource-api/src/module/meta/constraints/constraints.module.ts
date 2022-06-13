import { Module } from "@nestjs/common";
import { ConstraintsService } from "./constraints.service";
import { DynamodbModule } from "../../dynamodb/dynamodb.module";
import { ConstraintsController } from "./constraints.controller";

@Module({
  providers: [ConstraintsService],
  exports: [ConstraintsService],
  imports: [DynamodbModule],
  controllers: [ConstraintsController],
})
export class ConstraintsModule {}
