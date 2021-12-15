import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';

export class UserPoolStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Define the cognito user pool.
        const userPool = new cognito.UserPool(this, 'user-pool', {
            accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
            passwordPolicy: {
                minLength: 8,
                requireDigits: true,
                requireLowercase: true,
                requireUppercase: true,
                tempPasswordValidity: cdk.Duration.days(7),
            },
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
                username: true,
            },
        });

        new cdk.CfnOutput(this, 'region', {
            description: 'Cognito Region',
            value: cdk.Aws.REGION,
        });

        new cdk.CfnOutput(this, 'user-pool-id', {
            description: 'UserPoolId',
            value: userPool.userPoolId,
        });
    }
}
