# Resource API

## Running locally

### Start local dynamodb
```
docker-compose -f docker-compose-dynamodblocal.yml up -d
```

### Start server
```
LOCAL_DATABASE=1 yarn start:dev
```

## Testing

### Unit tests

```
yarn test
```

### E2E tests

```
yarn test:e2e
```
