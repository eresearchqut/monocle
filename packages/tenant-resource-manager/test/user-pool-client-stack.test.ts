import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as UserPoolClient from '../lib/user-pool-client-stack';

test('User Pool Client Stack', () => {
    const app = new App();
    // WHEN
    const userPoolClientStack = new UserPoolClient.UserPoolClientStack(app, 'UserPoolClientTestStack');
    const template = Template.fromStack(userPoolClientStack);

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
