# Projections

|                                       | INDEX                 | COMPOSITE_TRANSACTION | COMPOSITE_LOCK       | COMPOSITE_DISCRETE   | COMPOSITE_STREAM      |
|---------------------------------------|-----------------------|-----------------------|----------------------|----------------------|-----------------------|
| Max projected items per projection    | 1                     | ~10,000               | ~10,000              | Unlimited            | ~10,000               |
| Max projections per resource          | 19                    | Unlimited             | Unlimited            | Unlimited            | Unlimited             |
| Max projected items per resource      | 19                    | Unlimited             | Unlimited            | Unlimited            | Unlimited             |
| Max projected item ops on creation    | 19                    | Unlimited             | Unlimited            | 0                    | Unlimited             |
| Max projected item ops on update      | 19                    | 24                    | Unlimited            | 1                    | Unlimited             |
| Read / write capacity bucket          | GSI partition         | Base table partition  | Base table partition | Base table partition | Base table partition  |
| On projected item PUT fail            | Base & projected fail | Base & projected fail | Attempt rollback     | Projected fail       | Record projected item |
| one-to-one relationships              | ❌                     | ❌                     | ❌                    | ❌                    | ❌                     |
| one-to-many relationships             | ❌                     | ✅                     | ✅                    | ✅                    | ✅                     |
| many-to-one relationships             | ✅                     | ✅                     | ✅                    | ✅                    | ✅                     |
| many-to-many relationships            | ❌                     | ✅                     | ✅                    | ✅                    | ✅                     |
| Query item by 1 value per projection  | ✅                     | ✅                     | ✅                    | ✅                    | ✅                     |
| Query item by N values per projection | ❌                     | ✅                     | ✅                    | ✅                    | ✅                     |
| Sort item by 1 value per projection   | ✅                     | ✅                     | ✅                    | ✅                    | ✅                     |
| Sort item by N values per projection  | ❌                     | ✅                     | ✅                    | ✅                    | ✅                     |
| Eventually consistent reads           | ✅                     | ✅                     | ✅                    | ✅                    | ❌                     |
| Strongly consistent reads             | ❌                     | ✅                     | ❌                    | ✅                    | ❌                     |
| Item-level authorization              | ⏳                     | ⏳                     | ⏳                    | ⏳                    | ⏳                     |
| Request-specific authorization        | ⏳                     | ⏳                     | ⏳                    | ⏳                    | ❌                     |
| Retrieve in same request as resource  | ❌                     | ⏳                     | ⏳                    | ⏳                    | ⏳                     |

## Types

### INDEX
Index projections use DynamoDB GSIs

### COMPOSITE
Composite projections use the same partition key (or partition key prefix) as the target item

#### COMPOSITE_TRANSACTION
Uses DynamoDB transactions

- https://aws.amazon.com/blogs/aws/new-amazon-dynamodb-transactions/
- https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transaction-apis.html
- https://www.alexdebrie.com/posts/dynamodb-transactions/

On resource creation, a transaction **is not** used, allowing you to project as many items as you like.

On resource update, a transaction **is** used, only allowing you to update the base item, and 24 projected items

Transactions cost double the ordinary Read / Write Capacity Units.

#### COMPOSITE_LOCK

Locks base item during updates using a "Lock" item.

#### COMPOSITE_DISCRETE

Projected items are updated individually, rather than in bulk along with the base item

#### COMPOSITE_STREAM

Projected items are updated after being processed by the DynamoDB stream