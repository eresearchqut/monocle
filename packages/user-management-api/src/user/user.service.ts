import { Injectable } from '@nestjs/common';

import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoClientProvider } from '../cognito/cognito.client';

@Injectable()
export class UserService {
  private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient;

  constructor(private readonly cognitoClientProvider: CognitoClientProvider) {
    this.cognitoIdentityProviderClient =
      cognitoClientProvider.getCognitoIdentityProviderClient();
  }

  public list(UserPoolId: string): Promise<Array<UserType>> {
    const command = new ListUsersCommand({ UserPoolId });
    return this.cognitoIdentityProviderClient
      .send(command)
      .then((result) => result.Users);
  }
}
