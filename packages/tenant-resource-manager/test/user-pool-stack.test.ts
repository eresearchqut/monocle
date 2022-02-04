import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as UserPool from '../lib/user-pool-stack';


test('User Pool Stack', () => {
    const app = new App();
    // WHEN
    const userPoolStack = new UserPool.UserPoolStack(app, 'UserPoolTestStack');
    const template = Template.fromStack(userPoolStack);

    // THEN
    template.hasResourceProperties('AWS::Cognito::UserPool', {
        AdminCreateUserConfig: {AllowAdminCreateUserOnly: false},
        AliasAttributes: ['email'],
        AutoVerifiedAttributes: ['email'],
        EmailVerificationMessage: 'The verification code to your new account is {####}',
        EmailVerificationSubject: 'Verify your new account',
        Policies: {
            PasswordPolicy: {
                MinimumLength: 8,
                RequireLowercase: true,
                RequireNumbers: true,
                RequireUppercase: true,
                TemporaryPasswordValidityDays: 7
            }
        },
        SmsVerificationMessage: 'The verification code to your new account is {####}',
        VerificationMessageTemplate: {
            DefaultEmailOption: 'CONFIRM_WITH_CODE',
            EmailMessage: 'The verification code to your new account is {####}',
            EmailSubject: 'Verify your new account',
            SmsMessage: 'The verification code to your new account is {####}'
        }
    });
});
