import * as TenantResourceManager from '../lib/tenant-resource-manager-stack';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

test('Tenant Resource Manager Test', () => {

    const app = new App({
        context: {
            userPoolExportName: 'TenantUserPool',
            userPoolClientExportName: 'TenantUserPoolAdminClient',
        },
    });
    // WHEN

    const stack = new TenantResourceManager.TenantResourceManagerStack(app, 'TenantResourceManager');
    // THEN

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Cognito::UserPool', 1);
    template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    template.resourceCountIs('AWS::DynamoDB::Table', 2);

    template.hasOutput('UserPoolOutput', { Export: { Name: 'TenantResourceManagerUserPool' } });
    template.hasOutput('AdminClientOutput', { Export: { Name: 'TenantResourceManagerAdminClient' } });
    template.hasOutput('RbacTableOutput', { Export: { Name: 'TenantResourceManagerRbacTable' } });
    template.hasOutput('RbacAuditTableOutput', { Export: { Name: 'TenantResourceManagerRbacAuditTable' } });
});
