import * as TenantResourceManager from '../lib/tenant-resource-manager-stack';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

test('Tenant Resource Manager Test', () => {

    const app = new App();
    // WHEN

    const stack = new TenantResourceManager.TenantResourceManagerStack(app, 'TenantResourceManager');
    // THEN

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::Cognito::UserPool', 1);
    template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);

    template.hasOutput('TenantUserPool', {});
    template.hasOutput('TenantUserPoolClient', {});

});
