# Tables

| Name          | Purpose                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Root          | Primary authoritative data source                                                                      |
| History       | Log of operations performed on Root table, along with state                                            |
| Authorization | Reverse-indexing relationships according to authorization rules, can be rebuilt when auth rules change |

# Schema definition

| Access pattern                             | Table / GSI / LSI | PK                    | SK                    | Filter | Example                                             |
| ------------------------------------------ | ----------------- | --------------------- | --------------------- | ------ | --------------------------------------------------- |
| Get a registry definition                  | Root              | "registry_definition" | "registry_definition" |        | PK="registry_definition" SK="registry_definition"   |
| Get a registry's previous definitions      | History           | "registry_definition" |                       |        | PK="registry_definition"                            |
| Get a registry's previous definition       | History           | "registry_definition" | version               |        | PK="registry_definition" SK="v13"                   |
| Get a registry form's current definition   | Root              | "registry_definition" | formId                |        | PK="registry_definition" SK="f#patientDemographics" |
| Get a registry form's previous definitions | History           | formId                |                       |        | PK="f#patientDemographics"                          |
| Get a registry form's previous definition  | History           | formId                | version               |        | PK="f#patientDemographics" SK="v13"                 |

# Patient

| Access pattern                              | Table / GSI / LSI | PK        | SK                 | Filter | Example                                                                                 |
| ------------------------------------------- | ----------------- | --------- | ------------------ | ------ | --------------------------------------------------------------------------------------- |
| Get a patient                               | Root              | patientId | patientId          |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" |
| Get a patient's previous states             | History           | patientId |                    |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce"                                             |
| Get a patient's previous state              | History           | patientId | version            |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="v13"                                    |
| Get the current state of a patient's form   | Root              | patientId | formId:v0          |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="pf#patientDemographics:v0"               |
| Get the previous states of a patient's form | Root              | patientId | BEGINS_WITH formId |        | PK="p#daa7096e-c294-4ba4-b42a-2471fcaf94ce" SK="BEGINS WITH pf#patientDemographics"      |

# Form audit

| Access pattern                                       | Table / GSI / LSI | PK               | SK                                | Filter | Example                                                                                     |
| ---------------------------------------------------- | ----------------- | ---------------- | --------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| Get last saved version of patient's form at datetime | History.GSI-1     | patientId:formId | LE queryDateTime                  |        | PK="ppf#daa7096e-c294-4ba4-b42a-2471fcaf94ce:patientDemographics" SK="LE 2021-05-11" LIMIT=1 |
| Get forms saved for all patients in date range       | History.GSI-2     | formId           | BETWEEN startDateTime endDateTime |        | PK="pf#patientDemographics" SK="BETWEEN 2021-05-11T00:00:00 2021-05-15T15:00:00"             |

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
