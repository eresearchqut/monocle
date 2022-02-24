import { INestApplication, Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { validateConfigOverride } from "../src/app.config";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema";
import { NIL as NIL_UUID, v4 as uuid } from "uuid";
import { DynamodbModule } from "../src/module/dynamodb/dynamodb.module";
import { MetadataModule } from "../src/module/meta/metadata/metadata.module";
import { ResourceModule } from "../src/module/resource/resource.module";
import {
  AddressInput,
  BooleanInput,
  CaptchaInput,
  CountryInput,
  CurrencyInput,
  DateInput,
  DateTimeInput,
  EmailInput,
  Form,
  Input,
  InputType,
  MarkdownInput,
  MultilineTextInput,
  NumericInput,
  OptionsInput,
  RangeInput,
  SectionType,
  Signature,
  SvgMapInput,
  TextInput,
  TimeInput,
} from "@eresearchqut/form-definition";
import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDbClientProvider } from "../src/module/dynamodb/dynamodb.client";
import { match } from "ts-pattern";
import { buildApp } from "../src/app.build";
import { range } from "lodash";
import { FormModule } from "../src/module/meta/form/form.module";
import { ProjectionsModule } from "../src/module/meta/projections/projections.module";
import { AuthorizationModule } from "../src/module/meta/authorization/authorization.module";

const getTableInput = (name: string) => {
  const template = yaml.load(fs.readFileSync("template.yaml", "utf8"), {
    schema: CLOUDFORMATION_SCHEMA,
  }) as any;
  const sourceTable = template.Resources["ResourceTable"].Properties;
  return {
    ...sourceTable,
    StreamSpecification: undefined,
    TableName: name,
  };
};

const generateResourceName = () => `TestResource_${Date.now()}`;

const initApp = async (modules: any[]): Promise<INestApplication> => {
  const tableName = `E2E_Metadata_${Date.now()}`; // TODO: pass table name in context. Tables need org uuid, environment, audit, search etc. in suffix

  const dynamodbClient = new DynamoDBClient({
    region: "local",
    // logger: new DynamodbLogger(DynamodbService.name),
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake",
    },
    endpoint: "http://localhost:8000",
  });

  await dynamodbClient.send(new CreateTableCommand(getTableInput(tableName))).catch((e) => {
    console.error(e);
    throw new Error("Failed to create table for tests. Is dynamodb-local running?");
  });

  @Injectable()
  class TestDynamodbClientProvider {
    getClient(): DynamoDBClient {
      return dynamodbClient;
    }
  }

  const moduleRef = await Test.createTestingModule({
    imports: [
      ...modules,
      ConfigModule.forRoot({
        cache: true,
        expandVariables: true,
        ignoreEnvFile: true,
        isGlobal: true,
        validate: validateConfigOverride({
          RESOURCE_TABLE: tableName, // TODO: suffix with org and project from claims context
          VALIDATE_METADATA_ON_READ: true,
          VALIDATE_METADATA_ON_WRITE: true,
          VALIDATE_RESOURCE_ON_READ: true,
          VALIDATE_RESOURCE_ON_WRITE: true,
        }),
      }),
    ],
  })
    .overrideProvider(DynamoDbClientProvider)
    .useClass(TestDynamodbClientProvider)
    .compile();

  const app = moduleRef.createNestApplication();
  buildApp(app);
  await app.init();
  return app;
};

describe("Metadata", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp([DynamodbModule, MetadataModule, FormModule, ProjectionsModule, AuthorizationModule]);
  });

  it("Creates empty metadata", async () => {
    const resourceName = generateResourceName();

    // Create empty metadata
    await request(app.getHttpServer()).post(`/meta/metadata/${resourceName}`).expect(201).expect({ created: true });

    // Retrieve empty metadata
    await request(app.getHttpServer())
      .get(`/meta/metadata/${resourceName}`)
      .expect(200)
      .expect({
        version: "0.0.0",
        schemas: {
          formVersion: NIL_UUID,
          authorizationVersion: NIL_UUID,
          projectionsVersion: NIL_UUID,
        },
      });

    // Attempt re-creating metadata with the same name
    await request(app.getHttpServer())
      .post(`/meta/metadata/${resourceName}`)
      .expect(409)
      .expect((r) => r.body.message === "Item already exists");
  });

  it("Can retrieve the empty form", () => request(app.getHttpServer()).get(`/meta/form/${NIL_UUID}`).expect(200));

  it("Can add a new form", async () => {
    const formData = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [],
    };

    const formId = await request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: formData,
      })
      .expect(201)
      .expect((r) => expect(r.body).toHaveProperty("id"))
      .expect((r) => expect(r.body.created).toBe(true))
      .then((r) => r.body.id);

    await request(app.getHttpServer())
      .get(`/meta/form/${formId}`)
      .expect(200)
      .expect((r) => expect(r.body.form).toMatchObject(formData));
  });

  it("Can't add a form with an invalid definition", () =>
    request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: 11,
      })
      .expect(400));

  it("Creates metadata with a form", async () => {
    const resourceName = generateResourceName();

    // Create empty metadata
    await request(app.getHttpServer()).post(`/meta/metadata/${resourceName}`).expect(201).expect({ created: true });

    // Add a form
    const formDefinition: Form = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [
        {
          name: "TestSection",
          label: "Test Section",
          description: "Test Section Description",
          id: uuid(),
          type: SectionType.DEFAULT,
          inputs: [
            {
              name: "stringKey",
              label: "String Key",
              description: "String Key Description",
              type: InputType.TEXT,
              id: uuid(),
              required: true,
            },
            {
              name: "numberKey",
              label: "Number Key",
              description: "Number Key Description",
              type: InputType.NUMERIC,
              id: uuid(),
              required: true,
            },
          ],
        },
      ],
    };
    const formId = await request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: formDefinition,
      })
      .expect(201)
      .then((res) => res.body.id);

    // Create metadata v1.0.0
    await request(app.getHttpServer())
      .put(`/meta/metadata/${resourceName}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          projectionsVersion: NIL_UUID,
        },
      })
      .expect(200)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));

    // Get latest metadata
    await request(app.getHttpServer())
      .get(`/meta/metadata/${resourceName}`)
      .expect(200)
      .expect({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          projectionsVersion: NIL_UUID,
        },
      });
  });
});

describe("Resource forms", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp([ResourceModule]);
  });

  const crud = async (name: string, putData: unknown, updateData: unknown) => {
    // Create resource
    const resourceId = await request(app.getHttpServer())
      .post(`/resource/${name}`)
      .send({
        data: putData,
      })
      .expect(201)
      .expect((r) => expect(r.body.Data).toEqual(putData))
      .then((r) => r.body.Id);

    // Read resource
    await request(app.getHttpServer())
      .get(`/resource/${name}/${resourceId}`)
      .expect(200)
      .expect((r) => expect(r.body.Data).toEqual(putData));

    // Update resource
    await request(app.getHttpServer())
      .put(`/resource/${name}/${resourceId}`)
      .send({
        data: updateData,
      })
      .expect(200)
      .expect((r) => expect(r.body.Data).toEqual(updateData));

    // Read updated resource
    await request(app.getHttpServer())
      .get(`/resource/${name}/${resourceId}`)
      .expect(200)
      .expect((r) => expect(r.body.Data).toEqual(updateData));

    // Delete resource
    await request(app.getHttpServer()).delete(`/resource/${name}/${resourceId}`).expect(200);

    // Read deleted resource
    await request(app.getHttpServer()).get(`/resource/${name}/${resourceId}`).expect(404);
  };

  it("Can CRUD a default resource", async () => {
    const resourceName = generateResourceName();
    const resourceData = {
      key: "test",
    };
    const updatedResourceData = {
      key: "updated",
    };

    // Create empty metadata
    await request(app.getHttpServer()).post(`/meta/metadata/${resourceName}`).expect(201).expect({ created: true });

    await crud(resourceName, resourceData, updatedResourceData);
  });

  it("Can CRUD a resource with all inputs", async () => {
    const resourceName = generateResourceName();

    // Map over InputType enum
    // TS enums are weird https://stackoverflow.com/q/50376977
    const inputEnumMap = <T>(callbackFn: (value: InputType) => T) =>
      (Object.keys(InputType) as (keyof typeof InputType)[]).map((input: keyof typeof InputType) =>
        callbackFn(InputType[input])
      );

    // Form input and data generator
    const getInput = (inputType: InputType): { input: Input; values: unknown[] } =>
      match(inputType as InputType)
        .with(InputType.ADDRESS, (t): { input: AddressInput; values: any[] } => ({
          input: { name: "address", label: "ADDRESS", id: uuid(), required: true, type: t },
          values: [
            {
              streetNumber: "",
              street: "",
              suburb: "",
              city: "",
              state: "",
              country: "",
              postalCode: "",
            },
            {
              streetNumber: "123",
              street: "Street",
              suburb: "Suburb",
              city: "City",
              state: "State",
              country: "Country",
              postalCode: "1234",
            },
          ],
        }))
        .with(InputType.BOOLEAN, (t): { input: BooleanInput; values: any[] } => ({
          input: { name: "boolean", label: "BOOLEAN", id: uuid(), required: true, type: t },
          values: [false, true],
        }))
        .with(InputType.CAPTCHA, (t): { input: CaptchaInput; values: any[] } => ({
          input: {
            name: "captcha",
            label: "CAPTCHA",
            id: uuid(),
            required: true,
            type: t,
            siteKey: "",
            secretKey: "",
          },
          values: ["", "captchaData"],
        }))
        .with(InputType.CURRENCY, (t): { input: CurrencyInput; values: any[] } => ({
          input: {
            name: "currency",
            label: "CURRENCY",
            id: uuid(),
            required: true,
            type: t,
            currencyCode: "AUD",
          },
          values: [0, 11.5],
        }))
        .with(InputType.COUNTRY, (t): { input: CountryInput; values: any[] } => ({
          input: {
            name: "country",
            label: "COUNTRY",
            id: uuid(),
            required: true,
            type: t,
            multiselect: false,
          },
          values: ["", "AU"],
        }))
        .with(InputType.EMAIL, (t): { input: EmailInput; values: any[] } => ({
          input: { name: "email", label: "EMAIL", id: uuid(), required: true, type: t },
          values: ["example1@example.com", "example2@example.com"],
        }))
        .with(InputType.DATE, (t): { input: DateInput; values: any[] } => ({
          input: {
            name: "date",
            label: "DATE",
            id: uuid(),
            required: true,
            type: t,
          },
          values: ["2000-01-01", "2022-01-01"],
        }))
        .with(InputType.DATE_TIME, (t): { input: DateTimeInput; values: any[] } => ({
          input: { name: "dateTime", label: "DATE_TIME", id: uuid(), required: true, type: t },
          values: ["2000-01-01T00:00:00.000Z", "2022-01-01T00:00:00.000Z"],
        }))
        .with(InputType.MARKDOWN, (t): { input: MarkdownInput; values: any[] } => ({
          input: { name: "markdown", label: "MARKDOWN", id: uuid(), required: true, type: t },
          values: ["", "# Heading\n\nText"],
        }))
        .with(InputType.MULTILINE_TEXT, (t): { input: MultilineTextInput; values: any[] } => ({
          input: {
            name: "multilineText",
            label: "MULTILINE_TEXT",
            id: uuid(),
            required: true,
            type: t,
          },
          values: ["", "Line 1\nLine 2"],
        }))
        .with(InputType.NUMERIC, (t): { input: NumericInput; values: any[] } => ({
          input: { name: "numeric", label: "NUMERIC", id: uuid(), required: true, type: t },
          values: [0, 11],
        }))
        .with(InputType.OPTIONS, (t): { input: OptionsInput; values: any[] } => ({
          input: {
            name: "options",
            label: "OPTIONS",
            id: uuid(),
            required: true,
            type: t,
            multiselect: false,
            displayOptions: true,
            optionValueType: "string",
            options: [
              {
                id: uuid(),
                label: "Red",
                value: "red",
              },
              {
                id: uuid(),
                label: "Yellow",
                value: "yellow",
              },
            ],
          },
          values: ["red", "yellow"],
        }))
        .with(InputType.RANGE, (t): { input: RangeInput; values: any[] } => ({
          input: { name: "range", label: "RANGE", id: uuid(), required: true, type: t },
          values: [0, 11],
        }))
        .with(InputType.SIGNATURE, (t): { input: Signature; values: any[] } => ({
          input: { name: "signature", label: "SIGNATURE", id: uuid(), required: true, type: t },
          values: [
            "",
            "data:image/png;base64,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",
          ],
        }))
        .with(InputType.SVG_MAP, (t): { input: SvgMapInput; values: any[] } => ({
          input: {
            name: "svgMap",
            label: "SVG_MAP",
            id: uuid(),
            required: true,
            type: t,
            map: "MuscleGroupsV1",
          },
          values: [
            {
              value: "Trapezius",
              label: "Trapezius",
            },
            {
              value: "Right_Lat",
              label: "Right Lat",
            },
          ],
        }))
        .with(InputType.TEXT, (t): { input: TextInput; values: any[] } => ({
          input: {
            name: "text",
            label: "TEXT",
            id: uuid(),
            required: true,
            type: t,
          },
          values: ["", "Hello, world!"],
        }))
        .with(InputType.TIME, (t): { input: TimeInput; values: any[] } => ({
          input: {
            name: "time",
            label: "TIME",
            id: uuid(),
            required: true,
            type: t,
          },
          values: ["00:00:00", "11:11:11"],
        }))
        .exhaustive();

    const formDefinition: Form = {
      name: "ResourceForm",
      description: "Resource Form Description",
      sections: [
        {
          name: "resourceSection",
          label: "Resource Section",
          description: "Resource Section Description",
          id: uuid(),
          type: SectionType.DEFAULT,
          inputs: inputEnumMap((value) => getInput(value).input),
        },
      ],
    };

    const [resourceData, updatedResourceData] = inputEnumMap((value) => getInput(value)).reduce(
      ([initialSection, updatedSection], input) => {
        initialSection[input.input.name] = input.values[0];
        updatedSection[input.input.name] = input.values[1];
        return [initialSection, updatedSection];
      },
      [{}, {}] as [Record<string, unknown>, Record<string, unknown>]
    );

    // Create empty metadata
    await request(app.getHttpServer()).post(`/meta/metadata/${resourceName}`).expect(201).expect({ created: true });

    const formId = await request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: formDefinition,
      })
      .expect(201)
      .then((res) => res.body.id);

    // Create metadata version
    await request(app.getHttpServer())
      .put(`/meta/metadata/${resourceName}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          projectionsVersion: NIL_UUID,
        },
      })
      .expect(200);

    await crud(resourceName, { resourceSection: resourceData }, { resourceSection: updatedResourceData });
  });

  it("Can't CRUD a non-existing resource type", async () => {
    const resourceName = generateResourceName();
    const resourceId = uuid();

    // Create resource
    await request(app.getHttpServer())
      .post(`/resource/${resourceName}/${resourceId}`)
      .send({
        data: {
          key: "test",
        },
      })
      .expect(404);

    // Read resource
    await request(app.getHttpServer()).get(`/resource/${resourceName}/${resourceId}`).expect(404);

    // Update resource
    await request(app.getHttpServer())
      .put(`/resource/${resourceName}/${resourceId}`)
      .send({
        data: {
          key: "test",
        },
      })
      .expect(404);

    // Delete resource
    await request(app.getHttpServer()).delete(`/resource/${resourceName}/${resourceId}`).expect(404);
  });

  it("Queries created resources", async () => {
    // Create empty metadata
    const testResource = generateResourceName();
    await request(app.getHttpServer()).post(`/meta/metadata/${testResource}`).expect(201).expect({ created: true });

    const targetResource = generateResourceName();
    await request(app.getHttpServer()).post(`/meta/metadata/${targetResource}`).expect(201).expect({ created: true });

    // Add forms
    const formDefinition: Form = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [
        {
          name: "testSection",
          label: "Test Section",
          description: "Test Section Description",
          id: NIL_UUID,
          type: SectionType.DEFAULT,
          inputs: [
            {
              name: "numeric",
              label: "Numeric",
              description: "Numeric",
              type: InputType.NUMERIC,
              id: uuid(),
              required: true,
            },
          ],
        },
      ],
    };
    const formId = await request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: formDefinition,
      })
      .expect(201)
      .then((res) => res.body.id);

    // Create metadata v1.0.0
    await request(app.getHttpServer())
      .put(`/meta/metadata/${testResource}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          projectionsVersion: NIL_UUID,
        },
      })
      .expect(200)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));

    // Create resources
    const resourceIds = new Set(
      await Promise.all(
        range(5).map(async (index) =>
          request(app.getHttpServer())
            .post(`/resource/${testResource}`)
            .send({
              data: {
                testSection: {
                  numeric: index,
                },
              },
            })
            .expect(201)
            .then((r) => r.body.Id)
        )
      )
    );

    // Query resource
    await request(app.getHttpServer())
      .get(`/resource/${testResource}`)
      .expect(200)
      .then((r) => {
        expect(r.body.length).toEqual(5);
        expect(new Set(r.body.map((resource: { Id: string }) => resource.Id))).toEqual(resourceIds);
      });
  });
});

describe("Resource relationship projections", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp([ResourceModule]);
  });

  it("Can CRUD resources with relationships", async () => {
    // Create empty metadata
    const sourceResource = generateResourceName();
    await request(app.getHttpServer()).post(`/meta/metadata/${sourceResource}`).expect(201).expect({ created: true });

    const targetResource = generateResourceName();
    await request(app.getHttpServer()).post(`/meta/metadata/${targetResource}`).expect(201).expect({ created: true });

    // Add forms
    const sourceFormDefinition: Form = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [
        {
          name: "testSection",
          label: "Test Section",
          description: "Test Section Description",
          id: NIL_UUID,
          type: SectionType.DEFAULT,
          inputs: [
            {
              name: "targetKey1",
              label: "Target resource Key",
              description: "Target resource",
              type: InputType.TEXT,
              id: uuid(),
              required: true,
            },
            {
              name: "targetKey2",
              label: "Target resource Key",
              description: "Target resource",
              type: InputType.TEXT,
              id: uuid(),
              required: true,
            },
          ],
        },
      ],
    };
    const sourceFormId = await request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: sourceFormDefinition,
      })
      .expect(201)
      .then((res) => res.body.id);

    const targetFormDefinition: Form = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [
        {
          name: "testSection",
          label: "Test Section",
          description: "Test Section Description",
          id: uuid(),
          type: SectionType.DEFAULT,
          inputs: [
            {
              name: "targetValue",
              label: "Target Value",
              description: "Target resource",
              type: InputType.TEXT,
              id: uuid(),
              required: true,
            },
          ],
        },
      ],
    };
    const targetFormId = await request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: targetFormDefinition,
      })
      .expect(201)
      .then((res) => res.body.id);

    // Add relationship
    const sourceRelationshipsId = await request(app.getHttpServer())
      .post(`/meta/projections`)
      .send({
        projections: {
          indexRelationship: {
            type: "INDEX",
            resource: targetResource,
            key: "testSection.targetKey1",
            index: 1,
          },
          singleCompositeRelationship: {
            type: "COMPOSITE",
            resource: targetResource,
            key: "testSection.targetKey1",
            dataKey: "",
          },
          multipleCompositeRelationship: {
            type: "COMPOSITE",
            resource: targetResource,
            key: "testSection.*",
            dataKey: "",
          },
        },
      })
      .expect(201)
      .then((res) => res.body.id);

    // Create metadata v1.0.0
    await request(app.getHttpServer())
      .put(`/meta/metadata/${sourceResource}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: sourceFormId,
          authorizationVersion: NIL_UUID,
          projectionsVersion: sourceRelationshipsId,
        },
      })
      .expect(200)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));
    await request(app.getHttpServer())
      .put(`/meta/metadata/${targetResource}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: targetFormId,
          authorizationVersion: NIL_UUID,
          projectionsVersion: NIL_UUID,
        },
      })
      .expect(200)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));

    // Create target resource ids
    const targetResourceId1 = await request(app.getHttpServer())
      .post(`/resource/${targetResource}`)
      .send({
        data: {
          testSection: {
            targetValue: "Target",
          },
        },
      })
      .expect(201)
      .then((r) => r.body.Id);
    const targetResourceId2 = await request(app.getHttpServer())
      .post(`/resource/${targetResource}`)
      .send({
        data: {
          testSection: {
            targetValue: "Target",
          },
        },
      })
      .expect(201)
      .then((r) => r.body.Id);

    // Create source resources
    const sourceResourceIds = new Set(
      await Promise.all(
        range(5).map(async () =>
          request(app.getHttpServer())
            .post(`/resource/${sourceResource}`)
            .send({
              data: {
                testSection: {
                  targetKey1: targetResourceId1,
                  targetKey2: targetResourceId2,
                },
              },
            })
            .expect(201)
            .then((r) => r.body.Id)
        )
      )
    );

    // Query target relationships
    await Promise.all(
      ["indexRelationship", "singleCompositeRelationship"].map((r) =>
        request(app.getHttpServer())
          .get(`/resource/${targetResource}/${targetResourceId1}/${r}/${sourceResource}`)
          .expect(200)
          .then((r) => {
            expect(r.body.length).toEqual(5);
            expect(new Set(r.body.map((resource: { Id: string }) => resource.Id))).toEqual(sourceResourceIds);
          })
      )
    );
    await Promise.all(
      [targetResourceId1, targetResourceId2].map((targetResourceId) =>
        request(app.getHttpServer())
          .get(`/resource/${targetResource}/${targetResourceId}/multipleCompositeRelationship/${sourceResource}`)
          .expect(200)
          .then((r) => {
            expect(r.body.length).toEqual(5);
            expect(new Set(r.body.map((resource: { Id: string }) => resource.Id))).toEqual(sourceResourceIds);
          })
      )
    );

    const [firstSourceResource, secondSourceResource, ...remainingSourceResources] = Array.from(sourceResourceIds);
    const newSourceResourceIds = new Set(remainingSourceResources);

    // Delete first source resource
    await request(app.getHttpServer()).delete(`/resource/${sourceResource}/${firstSourceResource}`).expect(200);

    // Update second source resource
    await request(app.getHttpServer())
      .put(`/resource/${sourceResource}/${secondSourceResource}`)
      .send({
        data: {
          testSection: {
            targetKey1: "",
            targetKey2: "",
          },
        },
      })
      .expect(200);

    // Confirm only 3 related resources remain
    await Promise.all(
      ["indexRelationship", "singleCompositeRelationship"].map((r) =>
        request(app.getHttpServer())
          .get(`/resource/${targetResource}/${targetResourceId1}/${r}/${sourceResource}`)
          .expect(200)
          .then((r) => {
            expect(r.body.length).toEqual(3);
            expect(new Set(r.body.map((resource: { Id: string }) => resource.Id))).toEqual(newSourceResourceIds);
          })
      )
    );
    await Promise.all(
      [targetResourceId1, targetResourceId2].map((targetResourceId) =>
        request(app.getHttpServer())
          .get(`/resource/${targetResource}/${targetResourceId}/multipleCompositeRelationship/${sourceResource}`)
          .expect(200)
          .then((r) => {
            expect(r.body.length).toEqual(3);
            expect(new Set(r.body.map((resource: { Id: string }) => resource.Id))).toEqual(newSourceResourceIds);
          })
      )
    );
  });
});

describe("Resource sort projections", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp([ResourceModule]);
  });

  // TODO: split into individual tests
  it("Can sort resources", async () => {
    // Create empty metadata
    const testResource = generateResourceName();
    await request(app.getHttpServer()).post(`/meta/metadata/${testResource}`).expect(201).expect({ created: true });

    // Add form
    const formDefinition: Form = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [
        {
          name: "testSection",
          label: "Test Section",
          description: "Test Section Description",
          id: NIL_UUID,
          type: SectionType.DEFAULT,
          inputs: [
            {
              name: "index",
              label: "Index",
              description: "Index",
              type: InputType.NUMERIC,
              id: uuid(),
              required: true,
            },
            {
              name: "stringKey1",
              label: "String key 1",
              description: "String key 1",
              type: InputType.TEXT,
              id: uuid(),
              required: true,
            },
            {
              name: "stringKey2",
              label: "String key 2",
              description: "String key 2",
              type: InputType.TEXT,
              id: uuid(),
              required: true,
            },
            {
              name: "numberKey1",
              label: "Number key 1",
              description: "Number key 1",
              type: InputType.NUMERIC,
              id: uuid(),
              required: true,
            },
            {
              name: "numberKey2",
              label: "Number key 2",
              description: "Number key 2",
              type: InputType.NUMERIC,
              id: uuid(),
              required: true,
            },
            {
              name: "booleanKey1",
              label: "Boolean key 1",
              description: "Boolean key 1",
              type: InputType.BOOLEAN,
              id: uuid(),
              required: true,
            },
            {
              name: "booleanKey2",
              label: "Boolean key 2",
              description: "Boolean key 2",
              type: InputType.BOOLEAN,
              id: uuid(),
              required: true,
            },
          ],
        },
      ],
    };
    const formId = await request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: formDefinition,
      })
      .expect(201)
      .then((res) => res.body.id);

    // Add projection
    const projections = await request(app.getHttpServer())
      .post(`/meta/projections`)
      .send({
        projections: {
          stringIndexSort: {
            type: "INDEX",
            key: "testSection.stringKey1",
            index: 1,
          },
          stringCompositeSort: {
            type: "COMPOSITE",
            key: "testSection.stringKey2",
            dataKey: "$",
          },
          numberIndexSort: {
            type: "INDEX",
            key: "testSection.numberKey1",
            index: 2,
          },
          numberCompositeSort: {
            type: "COMPOSITE",
            key: "testSection.numberKey2",
            dataKey: "$",
          },
          booleanIndexSort: {
            type: "INDEX",
            key: "testSection.booleanKey1",
            index: 3,
          },
          booleanCompositeSort: {
            type: "COMPOSITE",
            key: "testSection.booleanKey2",
            dataKey: "$",
          },
        },
      })
      .expect(201)
      .then((res) => res.body.id);

    // Create metadata v1.0.0
    await request(app.getHttpServer())
      .put(`/meta/metadata/${testResource}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          projectionsVersion: projections,
        },
      })
      .expect(200)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));

    // Create resources
    const resourceIds = await Promise.all(
      [3, 5, 1, 4, 2].map(async (i) =>
        request(app.getHttpServer())
          .post(`/resource/${testResource}`)
          .send({
            data: {
              testSection: {
                index: i,
                stringKey1: i.toString(),
                stringKey2: i.toString(),
                numberKey1: i,
                numberKey2: i,
                booleanKey1: i % 2 === 0,
                booleanKey2: i % 2 === 0,
              },
            },
          })
          .expect(201)
          .then((r) => r.body.Id)
      )
    );

    // Query sorted projections
    await Promise.all(
      ["stringIndexSort", "stringCompositeSort", "numberIndexSort", "numberCompositeSort"].map((projection) =>
        Promise.all(
          [
            [undefined, [1, 2, 3, 4, 5]],
            ["reverse", [5, 4, 3, 2, 1]],
          ].map(([order, sorted]) =>
            request(app.getHttpServer())
              .get(`/resource/${testResource}/projection/${projection}`)
              .query({ order })
              .expect(200)
              .then((r) => {
                expect(r.body.length).toEqual(5);
                expect(r.body.map((resource: any) => resource.Data.testSection.index)).toEqual(sorted);
              })
          )
        )
      )
    );
    await Promise.all(
      ["booleanIndexSort", "booleanCompositeSort"].map((projection) =>
        Promise.all(
          [
            [undefined, [false, false, false, true, true]],
            ["reverse", [true, true, false, false, false]],
          ].map(([order, sorted]) =>
            request(app.getHttpServer())
              .get(`/resource/${testResource}/projection/${projection}`)
              .query({ order })
              .expect(200)
              .then((r) => {
                expect(r.body.length).toEqual(5);
                expect(r.body.map((resource: any) => resource.Data.testSection.index % 2 === 0)).toEqual(sorted);
              })
          )
        )
      )
    );

    const [firstResource, secondResource] = resourceIds;

    // Delete first resource
    await request(app.getHttpServer()).delete(`/resource/${testResource}/${firstResource}`).expect(200);

    // Update second resource
    await request(app.getHttpServer())
      .put(`/resource/${testResource}/${secondResource}`)
      .send({
        data: {
          testSection: {
            index: 6,
            stringKey1: "6",
            stringKey2: "6",
            numberKey1: 6,
            numberKey2: 6,
            booleanKey1: true,
            booleanKey2: true,
          },
        },
      })
      .expect(200);

    // Confirm updated resource order
    await Promise.all(
      ["stringIndexSort", "stringCompositeSort", "numberIndexSort", "numberCompositeSort"].map((projection) =>
        Promise.all(
          [
            [undefined, [1, 2, 4, 6]],
            ["reverse", [6, 4, 2, 1]],
          ].map(([order, sorted]) =>
            request(app.getHttpServer())
              .get(`/resource/${testResource}/projection/${projection}`)
              .query({ order })
              .expect(200)
              .then((r) => {
                expect(r.body.length).toEqual(4);
                expect(r.body.map((resource: any) => resource.Data.testSection.index)).toEqual(sorted);
              })
          )
        )
      )
    );
    await Promise.all(
      ["booleanIndexSort", "booleanCompositeSort"].map((projection) =>
        Promise.all(
          [
            [undefined, [false, true, true, true]],
            ["reverse", [true, true, true, false]],
          ].map(([order, sorted]) =>
            request(app.getHttpServer())
              .get(`/resource/${testResource}/projection/${projection}`)
              .query({ order })
              .expect(200)
              .then((r) => {
                expect(r.body.length).toEqual(4);
                expect(r.body.map((resource: any) => resource.Data.testSection.index % 2 === 0)).toEqual(sorted);
              })
          )
        )
      )
    );
  });
});

describe("Resource query projections", () => {
  let app: INestApplication;
  let testResource: string;
  let resourceIds: string[];

  const requestQuery = async (
    projection: string,
    query: string | number | boolean,
    queryType: string,
    expected: number[]
  ) =>
    request(app.getHttpServer())
      .get(`/resource/${testResource}/projection/${projection}`)
      .query({ query, queryType })
      .expect(200)
      .then((r) => {
        expect(r.body.map((resource: any) => resource.Data.testSection.index).sort()).toEqual(expected);
      });

  beforeAll(async () => {
    app = await initApp([ResourceModule]);

    // Create empty metadata
    testResource = generateResourceName();
    await request(app.getHttpServer()).post(`/meta/metadata/${testResource}`).expect(201).expect({ created: true });

    // Add form
    const formDefinition: Form = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [
        {
          name: "testSection",
          label: "Test Section",
          description: "Test Section Description",
          id: NIL_UUID,
          type: SectionType.DEFAULT,
          inputs: [
            {
              name: "index",
              label: "Index",
              description: "Index",
              type: InputType.NUMERIC,
              id: uuid(),
              required: true,
            },
            {
              name: "stringKey1",
              label: "String key 1",
              description: "String key 1",
              type: InputType.TEXT,
              id: uuid(),
              required: true,
            },
            {
              name: "stringKey2",
              label: "String key 2",
              description: "String key 2",
              type: InputType.TEXT,
              id: uuid(),
              required: true,
            },
            {
              name: "numberKey1",
              label: "Number key 1",
              description: "Number key 1",
              type: InputType.NUMERIC,
              id: uuid(),
              required: true,
            },
            {
              name: "numberKey2",
              label: "Number key 2",
              description: "Number key 2",
              type: InputType.NUMERIC,
              id: uuid(),
              required: true,
            },
            {
              name: "booleanKey1",
              label: "Boolean key 1",
              description: "Boolean key 1",
              type: InputType.BOOLEAN,
              id: uuid(),
              required: true,
            },
            {
              name: "booleanKey2",
              label: "Boolean key 2",
              description: "Boolean key 2",
              type: InputType.BOOLEAN,
              id: uuid(),
              required: true,
            },
          ],
        },
      ],
    };
    const formId = await request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: formDefinition,
      })
      .expect(201)
      .then((res) => res.body.id);

    // Add projection
    const projections = await request(app.getHttpServer())
      .post(`/meta/projections`)
      .send({
        projections: {
          stringIndexQuery: {
            type: "INDEX",
            key: "testSection.stringKey1",
            index: 1,
          },
          stringCompositeQuery: {
            type: "COMPOSITE",
            key: "testSection.stringKey2",
            dataKey: "$",
          },
          numberIndexQuery: {
            type: "INDEX",
            key: "testSection.numberKey1",
            index: 2,
          },
          numberCompositeQuery: {
            type: "COMPOSITE",
            key: "testSection.numberKey2",
            dataKey: "$",
          },
          booleanIndexQuery: {
            type: "INDEX",
            key: "testSection.booleanKey1",
            index: 3,
          },
          booleanCompositeQuery: {
            type: "COMPOSITE",
            key: "testSection.booleanKey2",
            dataKey: "$",
          },
        },
      })
      .expect(201)
      .then((res) => res.body.id);

    // Create metadata v1.0.0
    await request(app.getHttpServer())
      .put(`/meta/metadata/${testResource}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          projectionsVersion: projections,
        },
      })
      .expect(200)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));

    // Create resources
    const inputValues: [string, number, boolean][] = [
      ["abc", 123, true],
      ["abc", 456, false],
      ["def", 123, false],
      ["def", 456, true],
    ];
    resourceIds = await Promise.all(
      inputValues.map(async ([s, n, b], i) =>
        request(app.getHttpServer())
          .post(`/resource/${testResource}`)
          .send({
            data: {
              testSection: {
                index: i,
                stringKey1: s,
                stringKey2: s,
                numberKey1: n,
                numberKey2: n,
                booleanKey1: b,
                booleanKey2: b,
              },
            },
          })
          .expect(201)
          .then((r) => r.body.Id)
      )
    );
  });

  // TODO: split into individual tests
  it.each([
    {
      projections: { type: "string", projections: ["stringIndexQuery", "stringCompositeQuery"] },
      queries: [
        ["abc", "string", [0, 1]],
        ["def", "string", [2, 3]],
        ["ghi", "string", []],
      ],
    },
    {
      projections: {
        type: "number",
        projections: ["numberIndexQuery", "numberCompositeQuery"],
      },
      queries: [
        [123, "number", [0, 2]],
        [456, "number", [1, 3]],
        [789, "number", []],
      ],
    },
    {
      projections: {
        type: "boolean",
        projections: ["booleanIndexQuery", "booleanCompositeQuery"],
      },
      queries: [
        [true, "boolean", [0, 3]],
        [false, "boolean", [1, 2]],
      ],
    },
  ] as { projections: { type: string; projections: string[] }; queries: [string | number | boolean, string, number[]][] }[])(
    "Can query $projections.type projections",
    async ({ projections: { projections }, queries }) => {
      // Query projections
      await Promise.all(
        projections.map((projection) =>
          Promise.all(
            queries.map(([query, queryType, expected]) => requestQuery(projection, query, queryType, expected))
          )
        )
      );

      // const [firstResource, secondResource] = resourceIds;
      //
      // // Delete first resource
      // await request(app.getHttpServer()).delete(`/resource/${testResource}/${firstResource}`).expect(200);
      //
      // // Update second resource
      // await request(app.getHttpServer())
      //   .put(`/resource/${testResource}/${secondResource}`)
      //   .send({
      //     data: {
      //       testSection: {
      //         index: 4,
      //         stringKey1: "ghi",
      //         stringKey2: "ghi",
      //         numberKey1: 789,
      //         numberKey2: 789,
      //         booleanKey1: true,
      //         booleanKey2: true,
      //       },
      //     },
      //   })
      //   .expect(200);
      //
      // // Confirm updated resource order
      // const updatedQueries: [string[], [string | number | boolean, string, number[]][]][] = [
      //   [
      //     ["stringIndexQuery", "stringCompositeQuery"],
      //     [
      //       ["abc", "string", []],
      //       ["def", "string", [2, 3]],
      //       ["ghi", "string", [4]],
      //     ],
      //   ],
      //   [
      //     ["numberIndexQuery", "numberCompositeQuery"],
      //     [
      //       [123, "number", [2]],
      //       [456, "number", [3]],
      //       [789, "number", [4]],
      //     ],
      //   ],
      //   [
      //     ["booleanIndexQuery", "booleanCompositeQuery"],
      //     [
      //       [true, "boolean", [3, 4]],
      //       [false, "boolean", [2]],
      //     ],
      //   ],
      // ];
      // await Promise.all(
      //   updatedQueries.map(([projections, queries]) =>
      //     Promise.all(
      //       projections.map((projection) =>
      //         Promise.all(
      //           queries.map(([query, queryType, expected]) =>
      //             request(app.getHttpServer())
      //               .get(`/resource/${testResource}/projection/${projection}`)
      //               .query({ query, queryType })
      //               .expect(200)
      //               .then((r) => {
      //                 expect(r.body.map((resource: any) => resource.Data.testSection.index).sort()).toEqual(expected);
      //               })
      //           )
      //         )
      //       )
      //     )
      //   )
      // );
    }
  );
});
