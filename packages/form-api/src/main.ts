import { ConfigService } from "@nestjs/config";
import { AppConfigService } from "./app.config";
import { getApp } from "./app.build";

async function bootstrap() {
  const app = await getApp();

  const config: AppConfigService = app.get(ConfigService);
  const port = config.get("PORT");
  await app.listen(port);
}

(() => bootstrap())();
