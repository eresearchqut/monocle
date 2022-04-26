# Storybooks Bucket

To deploy the stack:

```
sam deploy --stack-name <stackname> --profile <profile> --capabilities CAPABILITY_NAMED_IAM
```

1. Create an access key for the PublisherUser
2. Add secrets to the repository for
3. Add the following secrets to the github repository:

   * STORYBOOK_AWS_S3_BUCKET=${AWS::StackName}-${AWS::AccountId}-${AWS::Region}
   * STORYBOOK_AWS_ACCESS_KEY_ID=<FROM_STEP_2_ABOVE>
   * STORYBOOK_AWS_SECRET_ACCESS_KEY=<FROM_STEP_2_ABOVE>
