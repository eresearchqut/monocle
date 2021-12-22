import {Injectable} from '@nestjs/common';
import {User} from './user.interface';

import {CognitoIdentityProviderClient, ListUsersCommand, UserType,} from '@aws-sdk/client-cognito-identity-provider';
import {CognitoClientProvider} from '../cognito/cognito.client';

const serialiseUser = (cognitoUser: UserType): User => {
    const {
        Enabled: enabled, UserCreateDate: created, UserLastModifiedDate: lastModified,
        UserStatus: status, Username: username, Attributes
    } = cognitoUser;
    const attributes = Attributes.reduce((mappedValues, attribute) => {
        try {
            mappedValues[attribute.Name] = JSON.parse(attribute.Value);
        } catch {
            mappedValues[attribute.Name] = attribute.Value;
        }
        return mappedValues;
    }, {})

    return {
        enabled, created, lastModified, status, username, attributes
    }
}

@Injectable()
export class UserService {
    private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient;

    constructor(private readonly cognitoClientProvider: CognitoClientProvider) {
        this.cognitoIdentityProviderClient =
            cognitoClientProvider.getCognitoIdentityProviderClient();
    }

    public list(UserPoolId: string): Promise<Array<User>> {
        const command = new ListUsersCommand({UserPoolId});
        return this.cognitoIdentityProviderClient
            .send(command)
            .then((result) => result.Users.map(serialiseUser));
    }
}
