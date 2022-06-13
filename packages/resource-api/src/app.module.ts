import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ResourceModule } from "./module/resource/resource.module";
import { ConfigModule } from "@nestjs/config";
import { validateConfig } from "./app.config";
import { DynamodbModule } from "./module/dynamodb/dynamodb.module";

@Module({
  imports: [
    ResourceModule,
    DynamodbModule,
    ConfigModule.forRoot({
      cache: true,
      expandVariables: true,
      ignoreEnvFile: true,
      isGlobal: true,
      validate: validateConfig,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
