import { Template } from 'aws-cdk-lib/assertions';
import { Stack } from 'aws-cdk-lib';
import * as Construct from '../lib/audited-table';
import { AuditedTableProps } from '../lib/audited-table';


describe('Audited Table Test', () => {

    test('With Tenant Id and 2 Provisioned GSIs', () => {

        const auditedTableProps: AuditedTableProps = {
            tenantId: 'Tenant-A',
            tableName: 'Table-A',
            provisionGsi: 2,
        };

        // WHEN
        const stack = new Stack();
        new Construct.AuditedTable(stack, 'AuditedTable', auditedTableProps);
        const template = Template.fromStack(stack);

        // THEN
        template.resourceCountIs('AWS::DynamoDB::Table', 2);
        template.resourceCountIs('AWS::Lambda::Function', 1);
        template.hasResourceProperties('AWS::DynamoDB::Table', {
            KeySchema: [
                {
                    AttributeName: 'PK',
                    KeyType: 'HASH',
                },
                {
                    AttributeName: 'SK',
                    KeyType: 'RANGE',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'PK',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'SK',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'GSI-PK-1',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'GSI-SK-1',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'GSI-PK-2',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'GSI-SK-2',
                    AttributeType: 'S',
                },
            ],
            BillingMode: 'PAY_PER_REQUEST',
            GlobalSecondaryIndexes: [
                {
                    IndexName: 'Tenant-A-Table-A-GSI-1',
                    KeySchema: [
                        {
                            AttributeName: 'GSI-PK-1',
                            KeyType: 'HASH',
                        },
                        {
                            AttributeName: 'GSI-SK-1',
                            KeyType: 'RANGE',
                        },
                    ],
                    Projection: {
                        ProjectionType: 'KEYS_ONLY',
                    },
                },
                {
                    IndexName: 'Tenant-A-Table-A-GSI-2',
                    KeySchema: [
                        {
                            AttributeName: 'GSI-PK-2',
                            KeyType: 'HASH',
                        },
                        {
                            AttributeName: 'GSI-SK-2',
                            KeyType: 'RANGE',
                        },
                    ],
                    Projection: {
                        ProjectionType: 'KEYS_ONLY',
                    },
                },
            ],
            StreamSpecification: {
                StreamViewType: 'NEW_AND_OLD_IMAGES',
            },
            TableName: 'Tenant-A-Table-A',
        });

        template.hasResourceProperties('AWS::DynamoDB::Table', {
            KeySchema: [
                {
                    AttributeName: 'PK',
                    KeyType: 'HASH',
                },
                {
                    AttributeName: 'SK',
                    KeyType: 'RANGE',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'PK',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'SK',
                    AttributeType: 'S',
                },
            ],
            BillingMode: 'PAY_PER_REQUEST',
            TableName: 'Tenant-A-Table-A-AUDIT',
        });

        template.hasResourceProperties('AWS::Lambda::Function',
            {
                'Description': 'Invoked on changes to Tenant-A-Table-A to audit changes into Tenant-A-Table-A-AUDIT',
                'Handler': 'index.handler',
                'Runtime': 'nodejs14.x',
                'Timeout': 60,
            },
        );

    });

    test('With No Tenant Id and 0 Provisioned GSIs', () => {

        const auditedTableProps: AuditedTableProps = {
            tableName: 'Table-B',
            provisionGsi: 0,
        };

        // WHEN
        const stack = new Stack();
        new Construct.AuditedTable(stack, 'AuditedTable', auditedTableProps);
        const template = Template.fromStack(stack);

        // THEN
        template.resourceCountIs('AWS::DynamoDB::Table', 2);
        template.resourceCountIs('AWS::Lambda::Function', 1);
        template.hasResourceProperties('AWS::DynamoDB::Table', {
            KeySchema: [
                {
                    AttributeName: 'PK',
                    KeyType: 'HASH',
                },
                {
                    AttributeName: 'SK',
                    KeyType: 'RANGE',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'PK',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'SK',
                    AttributeType: 'S',
                }
            ],
            BillingMode: 'PAY_PER_REQUEST',
            StreamSpecification: {
                StreamViewType: 'NEW_AND_OLD_IMAGES',
            },
            TableName: 'Table-B',
        });

        template.hasResourceProperties('AWS::DynamoDB::Table', {
            KeySchema: [
                {
                    AttributeName: 'PK',
                    KeyType: 'HASH',
                },
                {
                    AttributeName: 'SK',
                    KeyType: 'RANGE',
                },
            ],
            AttributeDefinitions: [
                {
                    AttributeName: 'PK',
                    AttributeType: 'S',
                },
                {
                    AttributeName: 'SK',
                    AttributeType: 'S',
                },
            ],
            BillingMode: 'PAY_PER_REQUEST',
            TableName: 'Table-B-AUDIT',
        });

        template.hasResourceProperties('AWS::Lambda::Function',
            {
                'Description': 'Invoked on changes to Table-B to audit changes into Table-B-AUDIT',
                'Handler': 'index.handler',
                'Runtime': 'nodejs14.x',
                'Timeout': 60,
            },
        );

    });
});