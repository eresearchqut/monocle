import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import * as DynamodbTable from '../lib/dynamodb-table-stack';

test('DynamodbTableStack Test', () => {
    const app = new App({
        context: {
            tenant_id: 'Tenant-A',
            table_name: 'Table-A',
            provision_gsi_count: 2,
        },
    });
    // WHEN
    const dynamodbTableStack = new DynamodbTable.DynamodbTableStack(app, 'TestDynamodbTableStack');
    const template = Template.fromStack(dynamodbTableStack);

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
