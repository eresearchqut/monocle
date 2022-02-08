import { INestApplication, Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { validateConfigOverride } from "../src/app.config";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema";
import { DynamodbLogger, DynamodbRepository } from "../src/module/dynamodb/dynamodb.repository";
import { NIL as NIL_UUID, v4 as uuid } from "uuid";
import { DynamodbModule } from "../src/module/dynamodb/dynamodb.module";
import { MetadataModule } from "../src/module/metadata/metadata.module";
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
import { isEqual, range } from "lodash";

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
    // logger: new DynamodbLogger(DynamodbRepository.name),
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

describe("Metadata module", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp([DynamodbModule, MetadataModule]);
  });

  it("Creates empty metadata", async () => {
    const resourceName = generateResourceName();

    // Create empty metadata
    await request(app.getHttpServer()).put(`/metadata/resource/${resourceName}`).expect(200).expect({ created: true });

    // Retrieve empty metadata
    await request(app.getHttpServer())
      .get(`/metadata/resource/${resourceName}`)
      .expect(200)
      .expect({
        version: "0.0.0",
        schemas: {
          formVersion: NIL_UUID,
          authorizationVersion: NIL_UUID,
          relationshipsVersion: NIL_UUID,
        },
      });

    // Attempt re-creating metadata with the same name
    await request(app.getHttpServer())
      .put(`/metadata/resource/${resourceName}`)
      .expect(409)
      .expect((r) => r.body.message === "Item already exists");
  });

  it("Can retrieve the empty form", () => request(app.getHttpServer()).get(`/metadata/form/${NIL_UUID}`).expect(200));

  it("Can add a new form", async () => {
    const formData = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [],
    };

    const formId = await request(app.getHttpServer())
      .put(`/metadata/form`)
      .send({
        definition: formData,
      })
      .expect(200)
      .expect((r) => expect(r.body).toHaveProperty("id"))
      .expect((r) => expect(r.body.created).toBe(true))
      .then((r) => r.body.id);

    await request(app.getHttpServer())
      .get(`/metadata/form/${formId}`)
      .expect(200)
      .expect((r) => expect(r.body.form).toMatchObject(formData));
  });

  it("Can't add a form with an invalid definition", () =>
    request(app.getHttpServer())
      .put(`/metadata/form`)
      .send({
        definition: 11,
      })
      .expect(400));

  it("Creates metadata with a form", async () => {
    const resourceName = generateResourceName();

    // Create empty metadata
    await request(app.getHttpServer()).put(`/metadata/resource/${resourceName}`).expect(200).expect({ created: true });

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
      .put(`/metadata/form`)
      .send({
        definition: formDefinition,
      })
      .expect(200)
      .then((res) => res.body.id);

    // Create metadata v1.0.0
    await request(app.getHttpServer())
      .post(`/metadata/resource/${resourceName}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          relationshipsVersion: NIL_UUID,
        },
      })
      .expect(201)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));

    // Get latest metadata
    await request(app.getHttpServer())
      .get(`/metadata/resource/${resourceName}`)
      .expect(200)
      .expect({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          relationshipsVersion: NIL_UUID,
        },
      });
  });
});

describe("Resource module", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp([DynamodbModule, MetadataModule, ResourceModule]);
  });

  const crud = async (name: string, putData: unknown, updateData: unknown) => {
    // Create resource
    const resourceId = await request(app.getHttpServer())
      .put(`/resource/${name}`)
      .send({
        data: putData,
      })
      .expect(200)
      .expect((r) => expect(r.body.Data).toEqual(putData))
      .then((r) => r.body.Id);

    // Read resource
    await request(app.getHttpServer())
      .get(`/resource/${name}/${resourceId}`)
      .expect(200)
      .expect((r) => expect(r.body.Data).toEqual(putData));

    // Update resource
    await request(app.getHttpServer())
      .post(`/resource/${name}/${resourceId}`)
      .send({
        data: updateData,
      })
      .expect(201)
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
    await request(app.getHttpServer()).put(`/metadata/resource/${resourceName}`).expect(200).expect({ created: true });

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
    await request(app.getHttpServer()).put(`/metadata/resource/${resourceName}`).expect(200).expect({ created: true });

    const formId = await request(app.getHttpServer())
      .put(`/metadata/form`)
      .send({
        definition: formDefinition,
      })
      .expect(200)
      .then((res) => res.body.id);

    // Create metadata version
    await request(app.getHttpServer())
      .post(`/metadata/resource/${resourceName}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          relationshipsVersion: NIL_UUID,
        },
      })
      .expect(201);

    await crud(resourceName, { resourceSection: resourceData }, { resourceSection: updatedResourceData });
  });

  it("Can't CRUD a non-existing resource type", async () => {
    const resourceName = generateResourceName();
    const resourceId = uuid();

    // Create resource
    await request(app.getHttpServer())
      .put(`/resource/${resourceName}/${resourceId}`)
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
      .post(`/resource/${resourceName}/${resourceId}`)
      .send({
        data: {
          key: "test",
        },
      })
      .expect(404);

    // Delete resource
    await request(app.getHttpServer()).delete(`/resource/${resourceName}/${resourceId}`).expect(404);
  });

  it.only("Creates resources with relationships", async () => {
    // Create empty metadata
    const sourceResource = generateResourceName();
    await request(app.getHttpServer())
      .put(`/metadata/resource/${sourceResource}`)
      .expect(200)
      .expect({ created: true });

    const targetResource = generateResourceName();
    await request(app.getHttpServer())
      .put(`/metadata/resource/${targetResource}`)
      .expect(200)
      .expect({ created: true });

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
              name: "targetKey",
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
      .put(`/metadata/form`)
      .send({
        definition: sourceFormDefinition,
      })
      .expect(200)
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
      .put(`/metadata/form`)
      .send({
        definition: targetFormDefinition,
      })
      .expect(200)
      .then((res) => res.body.id);

    // Add relationship
    const sourceRelationshipsId = await request(app.getHttpServer())
      .put(`/metadata/relationships`)
      .send({
        relationships: {
          relationship1: {
            type: "INDEX",
            resource: targetResource,
            key: "testSection.targetKey",
            index: 1,
          },
        },
      })
      .expect(200)
      .then((res) => res.body.id);

    // Create metadata v1.0.0
    await request(app.getHttpServer())
      .post(`/metadata/resource/${sourceResource}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: sourceFormId,
          authorizationVersion: NIL_UUID,
          relationshipsVersion: sourceRelationshipsId,
        },
      })
      .expect(201)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));
    await request(app.getHttpServer())
      .post(`/metadata/resource/${targetResource}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: targetFormId,
          authorizationVersion: NIL_UUID,
          relationshipsVersion: NIL_UUID,
        },
      })
      .expect(201)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));

    // Create target resource id
    const targetResourceId = await request(app.getHttpServer())
      .put(`/resource/${targetResource}`)
      .send({
        data: {
          testSection: {
            targetValue: "Target",
          },
        },
      })
      .expect(200)
      .then((r) => r.body.Id);

    // DELETE ME
    await request(app.getHttpServer())
      .get(`/resource/${targetResource}/${targetResourceId}`)
      .expect(200)
      .then((r) => r.body.Id);

    // Create source resources
    const sourceResourceIds = await Promise.all(
      range(5).map(async () =>
        request(app.getHttpServer())
          .put(`/resource/${sourceResource}`)
          .send({
            data: {
              testSection: {
                targetKey: targetResourceId,
              },
            },
          })
          .expect(200)
          .then((r) => r.body.Id)
      )
    );

    // Query target relationships
    await request(app.getHttpServer())
      .get(`/resource/${targetResource}/${targetResourceId}/relationship1/${sourceResource}`)
      .expect(200)
      .then((r) =>
        expect(
          isEqual(
            r.body.map((resource: { Id: string }) => resource.Id),
            sourceResourceIds
          )
        )
      );
  });
});
