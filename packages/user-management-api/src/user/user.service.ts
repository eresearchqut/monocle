import {Injectable} from '@nestjs/common';
import {Page, User} from './user.interface';
import {ConfigService} from '@nestjs/config';

import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
    ListUsersCommandInput,
    ListUsersCommandOutput,
    UserType
} from '@aws-sdk/client-cognito-identity-provider';
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

const USER_POOL_ID_ENV = "USER_POOL_ID"

@Injectable()
export class UserService {
    private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient;
    private readonly userPoolId: string;

    constructor(private readonly configService: ConfigService,
                private readonly cognitoClientProvider: CognitoClientProvider) {
        this.userPoolId = configService.get(USER_POOL_ID_ENV)
        this.cognitoIdentityProviderClient =
            cognitoClientProvider.getCognitoIdentityProviderClient();
    }

    public list(limit: number): Promise<Page<User>> {
        const command = new ListUsersCommand({UserPoolId: this.userPoolId, Limit: limit} as ListUsersCommandInput);
        return this.cognitoIdentityProviderClient
            .send(command)
            .then((result: ListUsersCommandOutput) => ({
                results: result.Users.map(serialiseUser),
                nextPageToken: result.PaginationToken
            }));
    }
}
