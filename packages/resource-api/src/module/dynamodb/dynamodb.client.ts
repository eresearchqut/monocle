import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../../app.config";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

@Injectable()
export class DynamoDbClientProvider {
  private readonly client: DynamoDBClient;

  constructor(private configService: ConfigService<AppConfig, true>) {
    if (this.configService.get("LOCAL_DATABASE")) {
      this.client = new DynamoDBClient({
        region: "local",
        credentials: {
          accessKeyId: "fake",
          secretAccessKey: "fake",
        },
        endpoint: this.configService.get("LOCAL_DATABASE_ENDPOINT"),
      });
    } else {
      this.client = new DynamoDBClient({
        region: this.configService.get("AWS_REGION"),
      });
    }
  }

  public getClient(): DynamoDBClient {
    return this.client;
  }
}
