import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

export function buildApp(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      skipMissingProperties: false,
      forbidUnknownValues: true,
      transform: true,
      skipNullProperties: false,
    })
  );
}

export async function getApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  buildApp(app);
  return app;
}
