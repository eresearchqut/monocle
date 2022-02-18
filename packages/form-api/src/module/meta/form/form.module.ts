import { Module } from "@nestjs/common";
import { FormService } from "./form.service";
import { DynamodbModule } from "../../dynamodb/dynamodb.module";
import { FormController } from "./form.controller";

@Module({
  providers: [FormService],
  exports: [FormService],
  imports: [DynamodbModule],
  controllers: [FormController],
})
export class FormModule {}
