import { ConfigService } from "@nestjs/config";
import { AppConfigService } from "./app.config";
import "reflect-metadata";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { getApp } from "./app.build";

async function bootstrap() {
  const app = await getApp();
  const config: AppConfigService = app.get(ConfigService);

  SwaggerModule.setup(
    "api",
    app,
    SwaggerModule.createDocument(app, new DocumentBuilder().setTitle("Resource API").setVersion("0.0.0").build())
  );

  const port = config.get("PORT");
  await app.listen(port);
}

(() => bootstrap())();
