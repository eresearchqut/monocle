import {Injectable} from '@nestjs/common';
import {Page, User} from './user.interface';
import {ConfigService} from '@nestjs/config';

import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
    ListUsersCommandInput,
    ListUsersCommandOutput,
    AdminGetUserCommand,
    AdminGetUserCommandInput,
    AdminGetUserCommandOutput,
    DescribeUserPoolCommand,
    DescribeUserPoolCommandInput,
    DescribeUserPoolCommandOutput,
    UserType
} from '@aws-sdk/client-cognito-identity-provider';
import {CognitoClientProvider} from '../client/cognito.client';

const serialiseUser = (cognitoUser: UserType | AdminGetUserCommandOutput): User => {
    const {
        Enabled: enabled, UserCreateDate: created, UserLastModifiedDate: lastModified,
        UserStatus: status, Username: username
    } = cognitoUser;
    const cognitoAttribues = cognitoUser['Attributes'] ? cognitoUser['Attributes'] : cognitoUser['UserAttributes'];
    const attributes = cognitoAttribues.reduce((mappedValues, attribute) => {
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

    public estimatedNumberOfUsers(): Promise<number> {
        const command = new DescribeUserPoolCommand({
            UserPoolId: this.userPoolId,
        } as DescribeUserPoolCommandInput);
        return this.cognitoIdentityProviderClient
            .send(command)
            .then((result: DescribeUserPoolCommandOutput) => result.UserPool.EstimatedNumberOfUsers);
    }

    public listUsers(limit?: number, filter?: string, startPageToken?: string): Promise<Page<User>> {
        const command = new ListUsersCommand({
            UserPoolId: this.userPoolId,
            Limit: limit,
            Filter: filter,
            PaginationToken: startPageToken
        } as ListUsersCommandInput);
        return this.cognitoIdentityProviderClient
            .send(command)
            .then((result: ListUsersCommandOutput) => ({
                results: result.Users.map(serialiseUser),
                nextPageToken: result.PaginationToken
            }));
    }

    public getUser(username): Promise<User> {
        const command = new AdminGetUserCommand({
            UserPoolId: this.userPoolId,
            Username: username,
        } as AdminGetUserCommandInput);
        return this.cognitoIdentityProviderClient
            .send(command)
            .then(serialiseUser);
    }


}
