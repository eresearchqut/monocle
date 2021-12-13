import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfigService } from "./app.config";

export async function getApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    })
  );
  return app;
}

async function bootstrap() {
  const app = await getApp();

  const config: AppConfigService = app.get(ConfigService);
  const port = config.get("PORT");
  await app.listen(port);
}

(() => bootstrap())();
