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
import { ConfigService } from '@nestjs/config';

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
    endpoint: `http://${global.__TESTCONTAINERS_COGNITO_IP__}:${global.__TESTCONTAINERS_COGNITO_PORT_9229__}`,
});

class LocalCognitoProvider {

    private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient = cognitoIdentityProviderClient;

    public getCognitoIdentityProviderClient(): CognitoIdentityProviderClient {
        return this.cognitoIdentityProviderClient;
    }

}

class TestConfigService {

    private userPoolId: string;

    constructor(userPoolId: string) {
        this.userPoolId = userPoolId;
    }


    public get(key: string): string {
        switch (key) {
            case 'USER_POOL_ID':
                return this.userPoolId;
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
            return new TestConfigService(userPoolId);
        },
    };

    const LocalCognitoClientProvider = {
        provide: CognitoClientProvider,
        useClass: LocalCognitoProvider,
    };


    beforeEach(async () => {

        const moduleRef = await Test.createTestingModule({
            providers: [LocalCognitoClientProvider, ConfigServiceProvider, UserService],
        }).compile();

        userService = moduleRef.get<UserService>(UserService);
        configService = moduleRef.get<ConfigService>(ConfigService);


    });

    it('user service should be defined', () => {
        expect(userService).toBeDefined();
    });

    it('added uesr should be listed', async () => {

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

});
