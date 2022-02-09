const TableName = process.env.AUDIT_TABLE_NAME;
const region = process.env.AWS_REGION || 'ap-southeast-2';
const {
    DynamoDBClient,
    PutItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const dynamoDBClient = new DynamoDBClient({ region });
exports.handler = async ({ Records }) => {
    for (const record of Records) {
        const { eventName, dynamodb } = record;
        const { OldImage, NewImage } = dynamodb;
        const document = eventName === 'REMOVE' ? unmarshall(OldImage) : unmarshall(NewImage);
        const { SK } = document;
        const command = new PutItemCommand({
            TableName,
            Item: marshall({
                EVENT_NAME: eventName,
                ...document,
                SK: `${SK}:${new Date().toISOString()}`,
            }),
        });
        return dynamoDBClient.send(command);
    }
};
