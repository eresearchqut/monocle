import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';


import * as UserPool from '../lib/user-pool';
import * as UserPoolClient from '../lib/user-pool-client';

test('User Pool Client Test', () => {



    // WHEN
    const stack = new Stack();
    const userPool = new UserPool.UserPool(stack, 'UserPoolTest').userPool;
    new UserPoolClient.UserPoolClient(stack, 'UserPoolClientTest', {
        userPool,
        customAttributes: [],
    });
    const template = Template.fromStack(stack);

    // THEN
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        AllowedOAuthFlows: [
            'implicit',
            'code',
        ],
        AllowedOAuthFlowsUserPoolClient: true,
        AllowedOAuthScopes: [
            'profile',
            'phone',
            'email',
            'openid',
            'aws.cognito.signin.user.admin',
        ],
        CallbackURLs: [
            'https://example.com',
        ],
        ExplicitAuthFlows: [
            'ALLOW_USER_PASSWORD_AUTH',
            'ALLOW_ADMIN_USER_PASSWORD_AUTH',
            'ALLOW_CUSTOM_AUTH',
            'ALLOW_USER_SRP_AUTH',
            'ALLOW_REFRESH_TOKEN_AUTH',
        ],
        ReadAttributes: [
            'address',
            'birthdate',
            'email',
            'email_verified',
            'family_name',
            'gender',
            'given_name',
            'locale',
            'middle_name',
            'name',
            'nickname',
            'phone_number',
            'phone_number_verified',
            'picture',
            'preferred_username',
            'profile',
            'updated_at',
            'website',
            'zoneinfo',
        ],
        SupportedIdentityProviders: [
            'SignInWithApple',
            'LoginWithAmazon',
            'COGNITO',
            'Facebook',
            'Google',
        ],
        WriteAttributes: [
            'address',
            'birthdate',
            'email',
            'family_name',
            'gender',
            'given_name',
            'locale',
            'middle_name',
            'name',
            'nickname',
            'phone_number',
            'picture',
            'preferred_username',
            'profile',
            'updated_at',
            'website',
            'zoneinfo',
        ],
    });
});
