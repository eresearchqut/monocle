import { Module } from '@nestjs/common';
import { CognitoClientProvider } from './cognito.client';

@Module({
  providers: [CognitoClientProvider],
  exports: [CognitoClientProvider],
})
export class CognitoModule {}
