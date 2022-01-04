import { getApp } from "./main";
import serverlessExpress from "@vendia/serverless-express";

let server;

/* eslint-disable @typescript-eslint/no-unused-vars */
async function bootstrap(): Promise<void> {
  if (!server) {
    const nestApp = await getApp();
    await nestApp.init();

    server = serverlessExpress({ app: nestApp.getHttpAdapter().getInstance() });
  }
}

export const handler = (event, context) => server(event, context);
