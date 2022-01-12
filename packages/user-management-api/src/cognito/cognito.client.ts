import {Injectable} from '@nestjs/common';
import {CognitoIdentityProviderClient} from '@aws-sdk/client-cognito-identity-provider';
import {ConfigService} from '@nestjs/config';
const AWS_REGION_ENV = 'AWS_REGION';
const AWS_REGION_DEFAULT = 'ap-southeast-2';


@Injectable()
export class CognitoClientProvider {
    private readonly cognitoIdentityProviderClient: CognitoIdentityProviderClient;

    constructor(private configService: ConfigService) {
        this.cognitoIdentityProviderClient = new CognitoIdentityProviderClient({
            region: this.configService.get<string>(AWS_REGION_ENV, AWS_REGION_DEFAULT),
        });
    }

    public getCognitoIdentityProviderClient(): CognitoIdentityProviderClient {
        return this.cognitoIdentityProviderClient;
    }
}
