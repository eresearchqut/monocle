import { aws_cognito as cognito, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class UserPool extends Construct {

    public readonly userPool: cognito.UserPool;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Define the cognito user pool.
        this.userPool = new cognito.UserPool(this, id, {
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

    }
}
