import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { AWS_REGION_DEFAULT, AWS_REGION_ENV } from './client.module';


@Injectable()
export class DynamoDBClientProvider {
    private readonly dynamoDBClient: DynamoDBClient;

    constructor(private configService: ConfigService) {
        this.dynamoDBClient = new DynamoDBClient({
            region: this.configService.get<string>(AWS_REGION_ENV, AWS_REGION_DEFAULT),
        });
    }

    public getDynamoDBClient(): DynamoDBClient {
        return this.dynamoDBClient;
    }
}
