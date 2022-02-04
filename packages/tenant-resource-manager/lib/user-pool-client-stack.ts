import { Aws, aws_cognito as cognito, CfnOutput, Fn, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class UserPoolClientStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const tenantId = this.node.tryGetContext('tenant_id');
        const userPool = cognito.UserPool.fromUserPoolId(this, 'userPoolId',
            Fn.importValue('userPoolId'));

        // Define the cognito user pool.
        const userPoolClient = userPool.addClient(`tenant-user-pool-client-${tenantId}`);

        new CfnOutput(this, 'region', {
            description: 'Cognito Region',
            value: Aws.REGION,
        });

        new CfnOutput(this, 'user-pool-client-id', {
            description: 'UserPoolClientId',
            value: userPoolClient.userPoolClientId,
            exportName: 'userPoolId',
        });
    }
}
