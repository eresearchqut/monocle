import serverlessExpress from "@vendia/serverless-express";
import { Callback, Context } from "aws-lambda";
import { getApp } from "./app.build";

let server: ReturnType<typeof serverlessExpress>;

async function bootstrap(): Promise<void> {
  if (!server) {
    const nestApp = await getApp();
    await nestApp.init();

    server = serverlessExpress({ app: nestApp.getHttpAdapter().getInstance() });
  }
}

export const handler = async (event: any, context: Context, callback: Callback) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
