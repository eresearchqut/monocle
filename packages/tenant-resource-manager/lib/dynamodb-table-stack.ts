import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, ProjectionType, StreamViewType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Code, Function, Runtime, StartingPosition } from 'aws-cdk-lib/aws-lambda';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

import {
    CONTEXT_ENVIRONMENT,
    CONTEXT_PROVISION_GSI_COUNT,
    CONTEXT_TABLE_NAME,
    CONTEXT_TENANT_ID,
    ENVIRONMENTS,
    TABLE_AUDIT,
    TABLE_GSI,
    TABLE_PARTITION_KEY_ATTRIBUTE,
    TABLE_SORT_KEY_ATTRIBUTE,
    TABLE_STREAM_FUNCTION,
} from './const';

export class DynamodbTableStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const tenantId = this.node.tryGetContext(CONTEXT_TENANT_ID);
        const tableName = this.node.tryGetContext(CONTEXT_TABLE_NAME);
        const environment = this.node.tryGetContext(CONTEXT_ENVIRONMENT);

        const table = new Table(this, tableName, {
            tableName: `${tenantId}-${tableName}`,
            partitionKey: {
                name: TABLE_PARTITION_KEY_ATTRIBUTE,
                type: AttributeType.STRING,
            },
            sortKey: {
                name: TABLE_SORT_KEY_ATTRIBUTE,
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            removalPolicy: ENVIRONMENTS.PROD === environment ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        });

        const provisionGsiCount = this.node.tryGetContext(CONTEXT_PROVISION_GSI_COUNT) || 20;
        for (let gsiIndex = 1; gsiIndex <= provisionGsiCount; gsiIndex += 1) {
            table
                .addGlobalSecondaryIndex({
                    indexName: `${tenantId}-${tableName}-${TABLE_GSI}-${gsiIndex}`,
                    partitionKey: {
                        name: `${TABLE_GSI}-${TABLE_PARTITION_KEY_ATTRIBUTE}-${gsiIndex}`,
                        type: AttributeType.STRING,
                    },
                    sortKey: {
                        name: `${TABLE_GSI}-${TABLE_SORT_KEY_ATTRIBUTE}-${gsiIndex}`,
                        type: AttributeType.STRING,
                    },
                    projectionType: ProjectionType.KEYS_ONLY,
                });
        }

        const auditTable = new Table(this, `${tableName}-${TABLE_AUDIT}`, {
            tableName: `${tenantId}-${tableName}-${TABLE_AUDIT}`,
            partitionKey: {
                name: TABLE_PARTITION_KEY_ATTRIBUTE,
                type: AttributeType.STRING,
            },
            sortKey: {
                name: TABLE_SORT_KEY_ATTRIBUTE,
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: ENVIRONMENTS.PROD === environment ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
        });

        const tableAuditFunction = new Function(this, `${tableName}-${TABLE_AUDIT}-${TABLE_STREAM_FUNCTION}`, {
            description: `Invoked on changes to ${tenantId}-${tableName} to audit changes into ${tenantId}-${tableName}-${TABLE_AUDIT}`,
            code: Code.fromAsset('lambda/StreamAuditFunction'),
            handler: 'index.handler',
            runtime: Runtime.NODEJS_14_X,
            environment: {
                AUDIT_TABLE_NAME: auditTable.tableName,
            },
            timeout: Duration.minutes(1),
        });

        tableAuditFunction.addEventSource(new DynamoEventSource(table, {
            startingPosition: StartingPosition.TRIM_HORIZON,
            batchSize: 5,
            bisectBatchOnError: true,
            retryAttempts: 10,
        }));

        auditTable.grantReadWriteData(tableAuditFunction);

    }
}
