import {Test} from '@nestjs/testing';
import {UserService} from './user.service';
import {CognitoClientProvider} from '../cognito/cognito.client'
import {CognitoIdentityProviderClient} from '@aws-sdk/client-cognito-identity-provider';
import {ConfigService} from '@nestjs/config';
import {mockClient} from 'aws-sdk-client-mock';

class CognitoClientProviderMock {

    // @ts-ignore
    private client: CognitoIdentityProviderClient = mockClient(CognitoIdentityProviderClient);

    getCognitoIdentityProviderClient(): CognitoIdentityProviderClient {
        return this.client;
    }
}

class ConfigServiceMock {
    get(key: string) {
        switch (key) {
            case 'USER_POOL_ID':
                return 'MOCK'
        }
    }
}


describe('UserService', () => {

    let service: UserService;

    const CognitoClientProviderProvider = {
        provide: CognitoClientProvider,
        useClass: CognitoClientProviderMock,
    };

    const ConfigServiceProvider = {
        provide: ConfigService,
        useClass: ConfigServiceMock,
    };

    beforeEach(async () => {


        const moduleRef = await Test.createTestingModule({
            providers: [CognitoClientProviderProvider, ConfigServiceProvider, UserService],
        }).compile();

        service = moduleRef.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
