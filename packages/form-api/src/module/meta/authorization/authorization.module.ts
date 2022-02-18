import { Module } from "@nestjs/common";
import { AuthorizationService } from "./authorization.service";
import { DynamodbModule } from "../../dynamodb/dynamodb.module";
import { AuthorizationController } from "./authorization.controller";

@Module({
  providers: [AuthorizationService],
  exports: [AuthorizationService],
  imports: [DynamodbModule],
  controllers: [AuthorizationController],
})
export class AuthorizationModule {}
