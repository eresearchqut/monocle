import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { CognitoClientProvider } from '../client/cognito.client';

import {
    AdminCreateUserCommand,
    CognitoIdentityProviderClient,
    CreateUserPoolClientCommand,
    CreateUserPoolClientCommandInput,
    CreateUserPoolCommand,
    CreateUserPoolCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { CreateTableCommand, CreateTableCommandInput, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClientProvider } from '../client/dynamodb.client';
import { v4 as uuidv4 } from 'uuid';

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
    endpoint: `http://${global.__TESTCONTAINERS_COGNITO_IP__}:${global.__TESTCONTAINERS_COGNITO_PORT_9229__}`,
    region: 'local',
    credentials: {
        accessKeyId: 'local',
        secretAccessKey: 'local'
    }
});

const dynamoDBClient = new DynamoDBClient({
    endpoint: `http://${global.__TESTCONTAINERS_DYNAMODB_IP__}:${global.__TESTCONTAINERS_DYNAMODB_PORT_8000__}`,
    region: 'local',
    credentials: {
        accessKeyId: 'local',
        secretAccessKey: 'local'
    }
});

class LocalCognitoProvider {
    public getCognitoIdentityProviderClient(): CognitoIdentityProviderClient {
        return cognitoIdentityProviderClient;
    }
}

class LocalDynamoDBProvider {
    public getDynamoDBClient(): DynamoDBClient {
        return dynamoDBClient;
    }
}

class TestConfigServiceProvider {

    private readonly userPoolId: string;
    private readonly rbacTableName: string;

    constructor(userPoolId: string, rbacTableName: string) {
        this.userPoolId = userPoolId;
        this.rbacTableName = rbacTableName;
    }

    public get(key: string): string {
        switch (key) {
            case 'USER_POOL_ID':
                return this.userPoolId;
            case 'RBAC_TABLE_NAME':
                return this.rbacTableName;
        }
    }
}


describe('UserService', () => {

    let userService: UserService;
    let configService: ConfigService;
    let userPoolClientId: String;

    const ConfigServiceProvider = {
        provide: ConfigService,
        useFactory: async () => {
            const userPoolId: string = await cognitoIdentityProviderClient.send(new CreateUserPoolCommand({
                PoolName: 'TEST_POOL',
            } as CreateUserPoolCommandInput))
                .then((output) => output.UserPool.Id);
            userPoolClientId = await cognitoIdentityProviderClient.send(new CreateUserPoolClientCommand({
                UserPoolId: userPoolId,
            } as CreateUserPoolClientCommandInput))
                .then((output) => output.UserPoolClient.ClientId);

            const rbacTableName: string = await dynamoDBClient.send(new CreateTableCommand(
                {
                    TableName: `RBAC_${uuidv4()}`,
                    KeySchema: [
                        { AttributeName: 'PK', KeyType: 'HASH' },
                        { AttributeName: 'SK', KeyType: 'RANGE' },
                    ],
                    AttributeDefinitions: [
                        { AttributeName: 'PK', AttributeType: 'S' },
                        { AttributeName: 'SK', AttributeType: 'S' },
                    ],
                    BillingMode: 'PAY_PER_REQUEST',
                } as CreateTableCommandInput,
            )).then((output) => output.TableDescription.TableName)
                .catch((error) => {
                    console.log(error);
                    return 'error';
                });

            return new TestConfigServiceProvider(userPoolId, rbacTableName);
        },
    };

    const LocalCognitoClientProvider = {
        provide: CognitoClientProvider,
        useClass: LocalCognitoProvider,
    };

    const LocalDynamoDBClientProvider = {
        provide: DynamoDBClientProvider,
        useClass: LocalDynamoDBProvider,
    };


    beforeEach(async () => {

        const moduleRef = await Test.createTestingModule({
            providers: [LocalCognitoClientProvider, LocalDynamoDBClientProvider, ConfigServiceProvider, UserService],
        }).compile();

        userService = moduleRef.get<UserService>(UserService);
        configService = moduleRef.get<ConfigService>(ConfigService);


    });

    it('user service should be defined', () => {
        expect(userService).toBeDefined();
    });

    it('added user should be listed', async () => {

        await cognitoIdentityProviderClient.send(new AdminCreateUserCommand({
            UserPoolId: configService.get('USER_POOL_ID'),
            Username: 'aloha@example.com',
            UserAttributes: [{ Name: 'email', Value: 'aloha@example.com' }],
            DesiredDeliveryMediums: ['EMAIL'],
        }));

        const userListing = await userService.listUsers();

        expect(userListing.nextPageToken).toBeUndefined();
        expect(userListing.results.length).toEqual(1);
        expect(userListing.results[0].username).toEqual('aloha@example.com');
    });


    it('add and remove user from group and check group membership', async () => {
        await userService
            .addUserToGroup('tenant_a', 'application_a', 'user_a', 'group_a');
        let userGroups = await userService
            .getUserGroups('tenant_a', 'application_a', 'user_a');
        expect(userGroups).toContain('group_a');
        expect(userGroups).not.toContain('group_b');

        await userService
            .removeUserFromGroup('tenant_a', 'application_a', 'user_a', 'group_a');
        userGroups = await userService
            .getUserGroups('tenant_a', 'application_a', 'user_a');
        expect(userGroups).toEqual([]);
    });

    it('add and remove user from role and check role membership', async () => {
        await userService
            .addUserToRole('tenant_a', 'application_a', 'user_a', 'role_a');
        let userRoles = await userService
            .getUserRoles('tenant_a', 'application_a', 'user_a');
        expect(userRoles).toContain('role_a');
        expect(userRoles).not.toContain('role_b');

        await userService
            .removeUserFromRole('tenant_a', 'application_a', 'user_a', 'role_a');
        userRoles = await userService
            .getUserRoles('tenant_a', 'application_a', 'user_a');
        expect(userRoles).toEqual([]);
    });

    it('add and remove role from group and check group roles', async () => {
        await userService
            .addRoleToGroup('tenant_a', 'application_a', 'role_a', 'group_a');
        let groupRoles = await userService
            .getGroupRoles('tenant_a', 'application_a', 'group_a');
        expect(groupRoles).toContain('role_a');
        expect(groupRoles).not.toContain('role_b');

        await userService
            .removeRoleFromGroup('tenant_a', 'application_a', 'role_a', 'group_a');
        groupRoles = await userService
            .getGroupRoles('tenant_a', 'application_a', 'group_a');
        expect(groupRoles).toEqual([]);
    });

    it('add and remove transitive group roles and check user role membership', async () => {
        await userService
            .addUserToGroup('tenant_a', 'application_a', 'user_b', 'group_b');
        await userService
            .addUserToRole('tenant_a', 'application_a', 'user_b', 'role_c');
        await userService
            .addRoleToGroup('tenant_a', 'application_a', 'role_b', 'group_b');
        let userRoles = await userService
            .getUserRoles('tenant_a', 'application_a', 'user_b');

        expect(userRoles).toContain('role_b');
        expect(userRoles).toContain('role_c');
        expect(userRoles).not.toContain('role_a');

        await userService
            .removeRoleFromGroup('tenant_a', 'application_a', 'role_b', 'group_b');
        userRoles = await userService
            .getUserRoles('tenant_a', 'application_a', 'user_b');

        expect(userRoles).toContain('role_c');
        expect(userRoles).not.toContain('role_a');
        expect(userRoles).not.toContain('role_b');
    });

});
