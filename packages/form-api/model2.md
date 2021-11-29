# Tables

| Name          | Purpose                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Root          | Primary authoritative data source                                                                      |
| History       | Log of operations performed on Root table, along with state                                            |
| Authorization | Reverse-indexing relationships according to authorization rules, can be rebuilt when auth rules change |

# Schema definition

| Access pattern                             | Table / GSI / LSI | PK                    | SK                    | Filter | Example                                           |
| ------------------------------------------ | ----------------- | --------------------- | --------------------- | ------ | ------------------------------------------------- |
| Get a registry definition                  | Root              | "registry_definition" | "registry_definition" |        | PK="registry_definition" SK="registry_definition" |
| Get a registry's previous definitions      | History           | "registry_definition" |                       |        | PK="registry_definition"                          |
| Get a registry's previous definition       | History           | "registry_definition" | version               |        | PK="registry_definition" SK="v13"                 |
| Get a registry form's current definition   | Root              | "registry_definition" | formId                |        | PK="registry_definition" SK="f#demographics"      |
| Get a registry form's previous definitions | History           | formId                |                       |        | PK="f#demographics"                               |
| Get a registry form's previous definition  | History           | formId                | version               |        | PK="f#demographics" SK="v13"                      |

# Patient

| Access pattern                    | Table / GSI / LSI | PK        | SK                    | Filter | Example                                                                                                                                                 |
| --------------------------------- | ----------------- | --------- | --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Get a patient                     | Root              | patientId | patientId             |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce"                                                                 |
| Get a patient's history in range  | History           | patientId | BETWEEN start and end |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce_p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="BETWEEN 1970-01-01T00:00:00+00:00 and 1971-01-01T00:00:00+00:00" |
| Get a patient's previous state    | History           | patientId | timestamp             |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce_p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="1970-01-01T00:00:00+00:00"                                       |
| Get all patients history in range | History.GSI-1     | "Patient" | BETWEEN start and end |        | PK="Patient" SK="BETWEEN 1970-01-01T00:00:00+00:00 and 1971-01-01T00:00:00+00:00"                                                                       |

# Patient Form

| Access pattern                                  | Table / GSI / LSI | PK               | SK                    | Filter | Example                                                                                                                                 |
| ----------------------------------------------- | ----------------- | ---------------- | --------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Get the longitudinal state of a patient's form  | Root              | patientId        | formId:latest         |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="pf#demographics:latest"                                                                 |
| Get the longitudinal states of a patient's form | Root              | patientId        | BEGINS_WITH formId    |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="BEGINS WITH pf#demographics"                                                            |
| Get a patient's form's history in range         | History           | patientId formId | BETWEEN start and end |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce_pf#demographics:latest" SK="BETWEEN 1970-01-01T00:00:00+00:00 and 1971-01-01T00:00:00+00:00" |
| Get a patient's form's history in range         | History           | patientId formId | timestamp             |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce_pf#demographics:latest" SK="1970-01-01T00:00:00+00:00"                                       |
| Get all patient form history in range           | History.GSI-1     | "PatientForm"    | BETWEEN start and end |        | PK="PatientForm" SK="BETWEEN 1970-01-01T00:00:00+00:00 and 1971-01-01T00:00:00+00:00"                                                   |

# Users

| Access pattern               | Table / GSI / LSI | PK                      | SK                                        | Filter | Example                                                                                                                             |
| ---------------------------- | ----------------- | ----------------------- | ----------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Get a user                   | Root              | userId                  | userId                                    |        | PK="u#9da046bc-89cd-4a5e-9f08-e2435085360b" SK="u#9da046bc-89cd-4a5e-9f08-e2435085360b"                                             |
| Get a user group             | Root              | userGroupId             | userGroupId                               |        | PK="ug#clinicA" SK="ug#clinicA"                                                                                                     |
| Get user's user groups       | Root              | userId                  | BEGINS_WITH "ug#"                         |        | PK="u#9da046bc-89cd-4a5e-9f08-e2435085360b" SK="BEGINS_WITH ug#"                                                                    |
| Get a patient's user groups  | Root              | patientId               | BEGINS_WITH "ug#"                         |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="BEGINS_WITH ug#"                                                                    |
| Get user group's patients    | Root.GSI-3        | userGroupId             | BEGINS_WITH "p#"                          |        | PK="ug#clinicA" SK="BEGINS_WITH p#"                                                                                                 |
| Get user group's users       | Root.GSI-3        | userGroupId             | BEGINS_WITH "u#"                          |        | PK="ug#clinicA" SK="BEGINS_WITH p#"                                                                                                 |
| Get all a user's patients ^1 | Root->Root.GSI-3  | userId->map userGroupId | BEGINS_WITH "ug#" -> map BEGINS_WITH "p#" |        | PK="u#9da046bc-89cd-4a5e-9f08-e2435085360b" SK="BEGINS_WITH ug#" -> map PK="ug#clinicA" SK="BEGINS WITH p#"                         |
| Check a user has patient     | Root->Root.GSI-3  | userId->map userGroupId | patientId                                 |        | PK="u#9da046bc-89cd-4a5e-9f08-e2435085360b" SK="BEGINS_WITH ug#" -> map PK="ug#clinicA" SK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" |

^1: Possibly replace two ddb reads with congito custom attribute for user's groups (cognito has 10,000 group limit)
