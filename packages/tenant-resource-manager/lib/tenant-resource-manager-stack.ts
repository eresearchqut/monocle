import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserPool } from './user-pool';
import { UserPoolClient } from './user-pool-client';
import { AuditedTable } from './audited-table';

export class TenantResourceManagerStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);


        const userPool = new UserPool(this, 'user-pool');
        const userPoolClient = new UserPoolClient(this, 'user-pool-client', {
            userPool: userPool.userPool,
            customAttributes: [],
        });

        const rbacStore = new AuditedTable(this, 'rbac-store', {
            tableName: 'RBAC_STORE',
            environment: this.node.tryGetContext('environment'),
        });

        new CfnOutput(this, 'TenantUserPool', {
            value: userPool.userPool.userPoolId,
            exportName: this.node.tryGetContext('userPoolExportName'),
        });
        new CfnOutput(this, 'TenantUserPoolClient', {
            value: userPoolClient.userPoolClient.userPoolClientId,
            exportName: this.node.tryGetContext('userPoolClientExportName'),
        });

    }
}
