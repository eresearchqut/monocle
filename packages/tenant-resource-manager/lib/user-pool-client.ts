import { aws_cognito as cognito } from 'aws-cdk-lib';
import { Construct } from 'constructs';


export interface UserPoolClientProps {
    userPool: cognito.UserPool;
    customAttributes: string[];
}

const standardCognitoAttributes = {
    givenName: true,
    familyName: true,
    email: true,
    emailVerified: true,
    address: true,
    birthdate: true,
    gender: true,
    locale: true,
    middleName: true,
    fullname: true,
    nickname: true,
    phoneNumber: true,
    phoneNumberVerified: true,
    profilePicture: true,
    preferredUsername: true,
    profilePage: true,
    timezone: true,
    lastUpdateTime: true,
    website: true,
};

export class UserPoolClient extends Construct {

    public readonly userPoolClient: cognito.UserPoolClient;

    constructor(scope: Construct, id: string, props: UserPoolClientProps) {

        super(scope, id);

        const { userPool, customAttributes } = props;

        const clientReadAttributes = new cognito.ClientAttributes()
            .withStandardAttributes(standardCognitoAttributes)
            .withCustomAttributes(...customAttributes);

        const clientWriteAttributes = new cognito.ClientAttributes()
            .withStandardAttributes({
                ...standardCognitoAttributes,
                emailVerified: false,
                phoneNumberVerified: false,
            })
            .withCustomAttributes(...customAttributes);

        this.userPoolClient = userPool.addClient(id, {
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userSrp: true,
                userPassword: true,
            },
            supportedIdentityProviders: [
                cognito.UserPoolClientIdentityProvider.APPLE,
                cognito.UserPoolClientIdentityProvider.AMAZON,
                cognito.UserPoolClientIdentityProvider.COGNITO,
                cognito.UserPoolClientIdentityProvider.FACEBOOK,
                cognito.UserPoolClientIdentityProvider.GOOGLE,
            ],
            readAttributes: clientReadAttributes,
            writeAttributes: clientWriteAttributes,
        });

    }
}
