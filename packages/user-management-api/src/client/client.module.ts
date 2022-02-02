import { Module } from '@nestjs/common';
import { CognitoClientProvider } from './cognito.client';
import { DynamoDBClientProvider } from './dynamodb.client';

export const AWS_REGION_ENV = 'AWS_REGION';
export const AWS_REGION_DEFAULT = 'ap-southeast-2';

@Module({
    providers: [CognitoClientProvider, DynamoDBClientProvider],
    exports: [CognitoClientProvider, DynamoDBClientProvider],
})
export class ClientModule {
}
