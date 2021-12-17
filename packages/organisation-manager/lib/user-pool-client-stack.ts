import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';

export class UserPoolClientStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const userPool = cognito.UserPool.fromUserPoolId(this, 'userPoolId', cdk.Fn.importValue('userPoolId'));

        // Define the cognito user pool.
        const userPoolClient = userPool.addClient('user-pool-client');

        new cdk.CfnOutput(this, 'region', {
            description: 'Cognito Region',
            value: cdk.Aws.REGION,
        });

        new cdk.CfnOutput(this, 'user-pool-client-id', {
            description: 'UserPoolClientId',
            value: userPoolClient.userPoolClientId,
            exportName: 'userPoolId',
        });
    }
}
