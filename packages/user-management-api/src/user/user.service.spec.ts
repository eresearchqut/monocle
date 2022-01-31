import {Test} from '@nestjs/testing';
import {UserService} from './user.service';
import {CognitoClientProvider} from '../cognito/cognito.client'

import {
    CognitoIdentityProviderClient,
    CreateUserPoolCommand,
    CreateUserPoolCommandInput
} from "@aws-sdk/client-cognito-identity-provider";
import {ConfigService} from '@nestjs/config';

const cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
    endpoint: `http://${global.__TESTCONTAINERS_COGNITO_IP__}:${global.__TESTCONTAINERS_COGNITO_PORT_9229__}`
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
    let cognitoClient: CognitoIdentityProviderClient;

    const ConfigServiceProvider = {
        provide: ConfigService,
        useFactory: async () => {
            const userPoolId: string = await cognitoIdentityProviderClient.send(new CreateUserPoolCommand({
                PoolName: 'TEST_POOL'
            } as CreateUserPoolCommandInput))
                .then((output) => output.UserPool.Id)
            return new TestConfigService(userPoolId);
        },
    };

    const LocalCognitoClientProvider = {
        provide: CognitoClientProvider,
        useClass: LocalCognitoProvider
    };


    beforeEach(async () => {

        const moduleRef = await Test.createTestingModule({
            providers: [LocalCognitoClientProvider, ConfigServiceProvider, UserService],
        }).compile();

        userService = moduleRef.get<UserService>(UserService);
    });

    it('user service should be defined', () => {
        expect(userService).toBeDefined();
    });

});
