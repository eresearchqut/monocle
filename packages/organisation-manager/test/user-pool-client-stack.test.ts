import { Template } from '@aws-cdk/assertions';
import * as cdk from '@aws-cdk/core';
import * as UserPool from '../lib/user-pool-stack';
import * as UserPoolClient from '../lib/user-pool-client-stack';

test('User Pool Client Stack', () => {
    const app = new cdk.App();
    // WHEN
    const userPoolStack = new UserPool.UserPoolStack(app, 'UserPoolTestStack');
    const userPoolClientStack = new UserPoolClient.UserPoolClientStack(app, 'UserPoolClientTestStack');

    const template = Template.fromStack(userPoolClientStack);
    console.log(JSON.stringify(template));

    // THEN
    template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        UserPoolId: { 'Fn::ImportValue': 'userPoolId' },
        AllowedOAuthFlows: ['implicit', 'code'],
        AllowedOAuthFlowsUserPoolClient: true,
        AllowedOAuthScopes: ['profile', 'phone', 'email', 'openid', 'aws.cognito.signin.user.admin'],
        CallbackURLs: ['https://example.com'],
        SupportedIdentityProviders: ['COGNITO'],
    });
});
