import { Aws, aws_cognito as cognito, CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class UserPoolStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Define the cognito user pool.
        const userPool = new cognito.UserPool(this, 'user-pool', {
            accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
            passwordPolicy: {
                minLength: 8,
                requireDigits: true,
                requireLowercase: true,
                requireUppercase: true,
                tempPasswordValidity: Duration.days(7),
            },
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
                username: true,
            },
        });

        new CfnOutput(this, 'region', {
            description: 'Cognito Region',
            value: Aws.REGION,
        });

        new CfnOutput(this, 'user-pool-id', {
            description: 'UserPoolId',
            value: userPool.userPoolId,
            exportName: 'user-pool-id',
        });
    }
}
