import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as UserPool from '../lib/user-pool';
import * as UserPoolClient from '../lib/user-pool-client';

export class TenantResourceManagerStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const userPool = new UserPool.UserPool(this, 'user-pool');
        const userPoolClient = new UserPoolClient.UserPoolClient(this, 'user-pool-client', {
            userPool: userPool.userPool,
            customAttributes: [],
        });

        new CfnOutput(this, 'Tenant User Pool', { value: userPool.userPool.userPoolId });
        new CfnOutput(this, 'TENANT_USER_POOL_CLIENT', { value: userPoolClient.userPoolClient.userPoolClientId });

    }
}
