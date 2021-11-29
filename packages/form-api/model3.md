# Get

| Access pattern                        | Table / GSI / LSI | PK                                   | SK                                   | Filter | Example                                                                                                                      |
| ------------------------------------- | ----------------- | ------------------------------------ | ------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Get a resource's current metadata     | Root              | "Resource:{name}#metadata:v0"        | "Resource:{name}#metadata:v0"        |        | ["Resource:Patient#metadata:v0", "Resource:Patient#metadata:v0"]                                                             |
| Get a resource's previous metadata    | Root              | "Resource:{name}#metadata:v2.11.0"   | "Resource:{name}#metadata:v2.11.0"   |        | ["Resource:Patient#metadata:v2.11.0", "Resource:Patient#metadata:v2.11.0"]                                                   |
| Get a resource's form                 | Root              | "Resource:{name}#form:{id}"          | "Resource:{name}#form:{id}"          |        | ["Resource:Patient#form:daa7096e-c294-4ba4-b42a-2471fcaf94ce", "Resource:Patient#form:daa7096e-c294-4ba4-b42a-2471fcaf94ce"] |
| Get a resource's authorization policy | Root              | "Resource:{name}#authorization:{id}" | "Resource:{name}#authorization:{id}" |        | ["Resource:Patient#metadata:v0", "authzn:daa7096e-c294-4ba4-b42a-2471fcaf94ce"]                                              |

# Notes

1.
