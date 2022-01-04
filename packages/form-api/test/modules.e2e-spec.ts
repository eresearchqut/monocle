import { INestApplication, Injectable } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { validateConfigOverride } from "../src/app.config";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema";
import { DynamodbLogger, DynamodbRepository } from "../src/module/dynamodb/dynamodb.repository";
import { NIL as NIL_UUID, v4 } from "uuid";
import { DynamodbModule } from "../src/module/dynamodb/dynamodb.module";
import { MetadataModule } from "../src/module/metadata/metadata.module";
import { ResourceModule } from "../src/module/resource/resource.module";
import { Form, InputType, SectionType } from "@eresearchqut/form-definition";
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

const generateResourceName = () => `TestResource_${v4()}`;

const initApp = async (modules: any[]): Promise<INestApplication> => {
  const tableName = `E2E_Metadata_${Date.now()}`; // TODO: pass table name in context. Tables need org uuid, environment, audit, search etc. in suffix

  const dynamodbClient = new DynamoDBClient({
    region: "local",
    logger: new DynamodbLogger(DynamodbRepository.name),
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
        groups: {
          Default: {
            formVersion: NIL_UUID,
            authorizationVersion: NIL_UUID,
          },
        },
      });

    // Attempt re-creating metadata with the same name
    await request(app.getHttpServer())
      .put(`/metadata/resource/${resourceName}`)
      .expect(409)
      .expect((r) => r.body.message === "Item already exists");
  });

  it("Can add a new form", async () => {
    const formData = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [],
    };

    const formId = await request(app.getHttpServer())
      .put(`/metadata/form`)
      .send({
        definition: JSON.stringify(formData),
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
        definition: JSON.stringify(11),
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
          id: v4(),
          type: SectionType.DEFAULT,
          inputs: [
            {
              name: "stringKey",
              label: "String Key",
              description: "String Key Description",
              type: InputType.TEXT,
              id: v4(),
              required: true,
            },
            {
              name: "numberKey",
              label: "Number Key",
              description: "Number Key Description",
              type: InputType.NUMERIC,
              id: v4(),
              required: true,
            },
          ],
        },
      ],
    };
    const formId = await request(app.getHttpServer())
      .put(`/metadata/form`)
      .send({
        definition: JSON.stringify(formDefinition),
      })
      .expect(200)
      .then((res) => res.body.id);

    // Create metadata v1.0.0
    await request(app.getHttpServer())
      .post(`/metadata/resource/${resourceName}?validation=validate`)
      .send({
        version: "1.0.0",
        groups: {
          Default: {
            formVersion: formId,
            authorizationVersion: NIL_UUID,
          },
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
        groups: {
          Default: {
            formVersion: formId,
            authorizationVersion: NIL_UUID,
          },
        },
      });
  });
});

describe("Resource module", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp([DynamodbModule, MetadataModule, ResourceModule]);
  });

  const crud = async (name, putData, updateData) => {
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

    // Form input and data generator
    const getInput = (inputType: InputType): { input: Input; values: unknown[] } =>
      match(inputType as InputType)
        .with(InputType.ADDRESS, (t): { input: AddressInput; values: any[] } => ({
          input: { name: "address", label: "ADDRESS", id: v4(), required: true, type: t },
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
          input: { name: "boolean", label: "BOOLEAN", id: v4(), required: true, type: t },
          values: [false, true],
        }))
        .with(InputType.CAPTCHA, (t): { input: CaptchaInput; values: any[] } => ({
          input: {
            name: "captcha",
            label: "CAPTCHA",
            id: v4(),
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
            id: v4(),
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
            id: v4(),
            required: true,
            type: t,
            multiselect: false,
          },
          values: ["", "AU"],
        }))
        .with(InputType.EMAIL, (t): { input: EmailInput; values: any[] } => ({
          input: { name: "email", label: "EMAIL", id: v4(), required: true, type: t },
          values: ["example1@example.com", "example2@example.com"],
        }))
        .with(InputType.DATE, (t): { input: DateInput; values: any[] } => ({
          input: {
            name: "date",
            label: "DATE",
            id: v4(),
            required: true,
            type: t,
          },
          values: ["2000-01-01", "2022-01-01"],
        }))
        .with(InputType.DATE_TIME, (t): { input: DateTimeInput; values: any[] } => ({
          input: { name: "dateTime", label: "DATE_TIME", id: v4(), required: true, type: t },
          values: ["2000-01-01T00:00:00.000Z", "2022-01-01T00:00:00.000Z"],
        }))
        .with(InputType.MARKDOWN, (t): { input: MarkdownInput; values: any[] } => ({
          input: { name: "markdown", label: "MARKDOWN", id: v4(), required: true, type: t },
          values: ["", "# Heading\n\nText"],
        }))
        .with(InputType.MULTILINE_TEXT, (t): { input: MultilineTextInput; values: any[] } => ({
          input: {
            name: "multilineText",
            label: "MULTILINE_TEXT",
            id: v4(),
            required: true,
            type: t,
          },
          values: ["", "Line 1\nLine 2"],
        }))
        .with(InputType.NUMERIC, (t): { input: NumericInput; values: any[] } => ({
          input: { name: "numeric", label: "NUMERIC", id: v4(), required: true, type: t },
          values: [0, 11],
        }))
        .with(InputType.OPTIONS, (t): { input: OptionsInput; values: any[] } => ({
          input: {
            name: "options",
            label: "OPTIONS",
            id: v4(),
            required: true,
            type: t,
            multiselect: false,
            displayOptions: true,
            optionValueType: "string",
            options: [
              {
                id: v4(),
                label: "Red",
                value: "red",
              },
              {
                id: v4(),
                label: "Yellow",
                value: "yellow",
              },
            ],
          },
          values: ["red", "yellow"],
        }))
        .with(InputType.RANGE, (t): { input: RangeInput; values: any[] } => ({
          input: { name: "range", label: "RANGE", id: v4(), required: true, type: t },
          values: [0, 11],
        }))
        .with(InputType.SIGNATURE, (t): { input: Signature; values: any[] } => ({
          input: { name: "signature", label: "SIGNATURE", id: v4(), required: true, type: t },
          values: [
            "",
            "data:image/png;base64,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",
          ],
        }))
        .with(InputType.SVG_MAP, (t): { input: SvgMapInput; values: any[] } => ({
          input: {
            name: "svgMap",
            label: "SVG_MAP",
            id: v4(),
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
            id: v4(),
            required: true,
            type: t,
          },
          values: ["", "Hello, world!"],
        }))
        .with(InputType.TIME, (t): { input: TimeInput; values: any[] } => ({
          input: {
            name: "time",
            label: "TIME",
            id: v4(),
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
          id: v4(),
          type: SectionType.DEFAULT,
          inputs: Object.keys(InputType).map((input: InputType) => getInput(InputType[input]).input),
        },
      ],
    };

    const resourceData = {
      resourceSection: Object.keys(InputType)
        .map((input: InputType) => getInput(InputType[input]))
        .reduce((section, input) => {
          section[input.input.name] = input.values[0];
          return section;
        }, {}),
    };
    const updatedResourceData = {
      resourceSection: Object.keys(InputType)
        .map((input: InputType) => getInput(InputType[input]))
        .reduce((section, input) => {
          section[input.input.name] = input.values[1];
          return section;
        }, {}),
    };

    // Create empty metadata
    await request(app.getHttpServer()).put(`/metadata/resource/${resourceName}`).expect(200).expect({ created: true });

    const formId = await request(app.getHttpServer())
      .put(`/metadata/form`)
      .send({
        definition: JSON.stringify(formDefinition),
      })
      .expect(200)
      .then((res) => res.body.id);

    // Create metadata version
    await request(app.getHttpServer())
      .post(`/metadata/resource/${resourceName}?validation=validate`)
      .send({
        version: "1.0.0",
        groups: {
          Default: {
            formVersion: formId,
            authorizationVersion: NIL_UUID,
          },
        },
      })
      .expect(201);

    await crud(resourceName, resourceData, updatedResourceData);
  });

  it("Can't CRUD a non-existing resource type", async () => {
    const resourceName = generateResourceName();
    const resourceId = v4();

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
});
