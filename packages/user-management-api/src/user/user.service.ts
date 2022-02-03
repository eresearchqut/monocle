import { Injectable } from '@nestjs/common';
import { Page, User } from './user.interface';
import { ConfigService } from '@nestjs/config';

import {
    AdminGetUserCommand,
    AdminGetUserCommandInput,
    AdminGetUserCommandOutput,
    CognitoIdentityProviderClient,
    DescribeUserPoolCommand,
    DescribeUserPoolCommandInput,
    DescribeUserPoolCommandOutput,
    ListUsersCommand,
    ListUsersCommandInput,
    ListUsersCommandOutput,
    UserType,
} from '@aws-sdk/client-cognito-identity-provider';

import {
    DynamoDBClient,
    PutItemCommand,
    PutItemCommandInput,
    QueryCommand,
    QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { flatten, uniq } from 'lodash';

import { CognitoClientProvider } from '../client/cognito.client';
import { DynamoDBClientProvider } from '../client/dynamodb.client';

const serialiseUser = (cognitoUser: UserType | AdminGetUserCommandOutput): User => {
    const {
        Enabled: enabled, UserCreateDate: created, UserLastModifiedDate: lastModified,
        UserStatus: status, Username: username,
    } = cognitoUser;
    const cognitoAttribues = cognitoUser['Attributes'] ? cognitoUser['Attributes'] : cognitoUser['UserAttributes'];
    const attributes = cognitoAttribues.reduce((mappedValues, attribute) => {
        try {
            mappedValues[attribute.Name] = JSON.parse(attribute.Value);
        } catch {
            mappedValues[attribute.Name] = attribute.Value;
        }
        return mappedValues;
    }, {});

    return {
        enabled, created, lastModified, status, username, attributes,
    };
};

const USER_POOL_ID_ENV = 'USER_POOL_ID';
const RBAC_TABLE_NAME_ENV = 'RBAC_TABLE_NAME';
const RBAC_PK_ATTRIBUTE_NAME = 'PK';
const RBAC_SK_ATTRIBUTE_NAME = 'SK';
const RBAC_USER_PREFIX = 'USER';
const RBAC_ROLE_PREFIX = 'ROLE';
const RBAC_GROUP_PREFIX = 'GROUP';

@Injectable()
export class UserService {
    private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient;
    private readonly dynamoDBClient: DynamoDBClient;
    private readonly userPoolId: string;
    private readonly rbacTableName: string;

    constructor(private readonly configService: ConfigService,
                private readonly cognitoClientProvider: CognitoClientProvider,
                private readonly dynamoDBClientProvider: DynamoDBClientProvider) {
        this.userPoolId = configService.get(USER_POOL_ID_ENV);
        this.rbacTableName = configService.get(RBAC_TABLE_NAME_ENV);
        this.cognitoIdentityProviderClient =
            cognitoClientProvider.getCognitoIdentityProviderClient();
        this.dynamoDBClient = dynamoDBClientProvider.getDynamoDBClient();
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
            PaginationToken: startPageToken,
        } as ListUsersCommandInput);
        return this.cognitoIdentityProviderClient
            .send(command)
            .then((result: ListUsersCommandOutput) => ({
                results: result.Users.map(serialiseUser),
                nextPageToken: result.PaginationToken,
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

    /**
     * Add a user to a role for the given application and tenant
     * @param tenant_id
     * @param application_id
     * @param user_id
     * @param role_id
     */
    public addUserToRole(tenant_id: string, application_id: string, user_id: string, role_id: string) {
        return this.addAssociation(tenant_id, application_id, user_id, RBAC_USER_PREFIX, role_id, RBAC_ROLE_PREFIX);
    }


    /**
     * Add a user to a group for the given application and tenant
     * @param tenant_id
     * @param application_id
     * @param user_id
     * @param group_id
     */
    public addUserToGroup(tenant_id: string, application_id: string, user_id: string, group_id: string) {
        return this.addAssociation(tenant_id, application_id, user_id, RBAC_USER_PREFIX, group_id, RBAC_GROUP_PREFIX);
    }

    /**
     * Add a role to a group for the given application and tenant. All users in this group will inherit this role.
     * @param tenant_id
     * @param application_id
     * @param role_id
     * @param group_id
     */
    public addRoleToGroup(tenant_id: string, application_id: string, role_id: string, group_id: string) {
        return this.addAssociation(tenant_id, application_id, group_id, RBAC_GROUP_PREFIX, role_id, RBAC_ROLE_PREFIX);
    }


    private addAssociation(tenant_id: string, application_id: string, id: string, id_prefix: string, association_id: string, association_prefix: string) {
        const command = new PutItemCommand({
            TableName: this.rbacTableName,
            Item: marshall({
                [RBAC_PK_ATTRIBUTE_NAME]: `${tenant_id}:${application_id}:${id_prefix}:${id}`,
                [RBAC_SK_ATTRIBUTE_NAME]: `${association_prefix}:${association_id}`,
            }),
        } as PutItemCommandInput);
        return this.dynamoDBClient.send(command);
    }


    /**
     * Get the groups for a user
     * @param tenant_id
     * @param application_id
     * @param user_id
     */
    public getUserGroups(tenant_id: string, application_id: string, user_id: string): Promise<string[]> {
        return this.getAssociations(tenant_id, application_id, user_id, RBAC_USER_PREFIX, RBAC_GROUP_PREFIX);
    }

    /**
     * Get the roles for a group
     * @param tenant_id
     * @param application_id
     * @param group_id
     */
    public getGroupRoles(tenant_id: string, application_id: string, group_id: string): Promise<string[]> {
        return this.getAssociations(tenant_id, application_id, group_id, RBAC_GROUP_PREFIX, RBAC_ROLE_PREFIX);
    }

    /**
     * Get the roles for a user including their direct roles associations and transitive group role associations
     * @param tenant_id
     * @param application_id
     * @param user_id
     */
    public getUserRoles(tenant_id: string, application_id: string, user_id: string): Promise<string[]> {
        return this.getUserGroups(tenant_id, application_id, user_id)
            .then((group_ids) => Promise.all(group_ids.map((group_id) => this
                .getGroupRoles(tenant_id, application_id, group_id))
                .concat(this.getAssociations(tenant_id, application_id, user_id, RBAC_USER_PREFIX, RBAC_ROLE_PREFIX)))
                .then((results) => uniq(flatten(results))));
    }


    private getAssociations(tenant_id: string, application_id: string, id: string, id_prefix: string, association_prefix: string): Promise<string[]> {
        const command = new QueryCommand({
            TableName: this.rbacTableName,
            KeyConditionExpression: '#pk = :pk and begins_with(#sk, :skPrefix)',
            ExpressionAttributeNames: {
                '#pk': RBAC_PK_ATTRIBUTE_NAME,
                '#sk': RBAC_SK_ATTRIBUTE_NAME,
            },
            ExpressionAttributeValues: marshall({
                ':pk': `${tenant_id}:${application_id}:${id_prefix}:${id}`,
                ':skPrefix': association_prefix,
            }),
        } as QueryCommandInput);
        return this.dynamoDBClient.send(command)
            .then((result) => result.Items
                .map((item) => unmarshall(item))
                .map((unmarshalledItem) => unmarshalledItem[RBAC_SK_ATTRIBUTE_NAME].split(':')[1]));
    }


}
