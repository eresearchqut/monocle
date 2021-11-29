# Resource

| Method | Path            |
| ------ | --------------- |
| PUT    | /{resource}     |
| GET    | /{resource}/:id |
| POST   | /{resource}/:id |
| DELETE | /{resource}/:id |

TODO: Resource relationships

# Metadata

| Method | Path                            |
| ------ | ------------------------------- |
| PUT    | /{resource}/metadata            |
| GET    | /{resource}/metadata/[:version] |

# Form schema

| Method | Path                                 |
| ------ | ------------------------------------ |
| PUT    | /{resource}/metadata/form            |
| GET    | /{resource}/metadata/form/[:version] |

# Authorization policy

| Method | Path                                          |
| ------ | --------------------------------------------- |
| PUT    | /{resource}/metadata/authorization            |
| GET    | /{resource}/metadata/authorization/[:version] |
