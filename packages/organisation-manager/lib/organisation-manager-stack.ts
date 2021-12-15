import { Construct, StackProps, Stack } from '@aws-cdk/core';

export class OrganisationManagerStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // The code that defines your stack goes here

        // example resource
        // const queue = new sqs.Queue(this, 'OrganisationManagerQueue', {
        //   visibilityTimeout: cdk.Duration.seconds(300)
        // });
    }
}
