import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { UserPool } from './user-pool';
import { UserPoolClient } from './user-pool-client';
import { AuditedTable } from './audited-table';

export class TenantResourceManagerStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);


        const userPool = new UserPool(this, 'UserPool');
        const adminClient = new UserPoolClient(this, 'AdminClient', {
            userPool: userPool.userPool,
            customAttributes: [],
        });
        const rbacTable = new AuditedTable(this, 'RbacTable', {
            tableName: `${this.stackName}-Rbac`,
            environment: this.node.tryGetContext('environment'),
        });

        new CfnOutput(this, 'UserPoolOutput', {
            value: userPool.userPool.userPoolId,
            exportName: `${this.stackName}UserPool` ,
        });

        new CfnOutput(this, 'AdminClientOutput', {
            value: adminClient.userPoolClient.userPoolClientId,
            exportName: `${this.stackName}AdminClient`,
        });

        new CfnOutput(this, 'RbacTableOutput', {
            value: rbacTable.table.tableName,
            exportName: `${this.stackName}RbacTable`,
        });

        new CfnOutput(this, 'RbacAuditTableOutput', {
            value: rbacTable.auditTable.tableName,
            exportName: `${this.stackName}RbacAuditTable`,
        });


    }
}
