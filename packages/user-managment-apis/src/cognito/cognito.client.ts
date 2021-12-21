import { Injectable } from '@nestjs/common';

import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@nestjs/config';

const defaultRegion = 'ap-southeast-2';

@Injectable()
export class CognitoClientProvider {
  private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient;

  constructor(private configService: ConfigService) {
    this.cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
      region: this.configService.get<string>('AWS_REGION', defaultRegion),
    });
  }

  public getCognitoIdentityProviderClient(): CognitoIdentityProviderClient {
    return this.cognitoIdentityProviderClient;
  }
}
