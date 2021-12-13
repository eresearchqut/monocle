import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as request from "supertest";
import { ConfigModule } from "@nestjs/config";
import { validateConfigOverride } from "../src/app.config";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { CLOUDFORMATION_SCHEMA } from "cloudformation-js-yaml-schema";
import { DynamodbService } from "../src/module/dynamodb/dynamodb.service";
import { JSONSchemaType } from "ajv";
import { v4 } from "uuid";
import { DynamodbModule } from "../src/module/dynamodb/dynamodb.module";
import { MetadataModule } from "../src/module/metadata/metadata.module";
import { ResourceModule } from "../src/module/resource/resource.module";

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
  const tableName = `E2E_Metadata_${Date.now()}`;

  const moduleRef = await Test.createTestingModule({
    imports: [
      ...modules,
      ConfigModule.forRoot({
        cache: true,
        expandVariables: true,
        ignoreEnvFile: true,
        isGlobal: true,
        validate: validateConfigOverride({
          LOCAL_DATABASE: true,
          RESOURCE_TABLE: tableName,
          LOG_DYNAMODB_REQUESTS: true,
          VALIDATE_METADATA_ON_READ: true,
          VALIDATE_METADATA_ON_WRITE: true,
          VALIDATE_RESOURCE_ON_READ: true,
          VALIDATE_RESOURCE_ON_WRITE: true,
        }),
      }),
    ],
  }).compile();

  await moduleRef.get(DynamodbService).createTable(getTableInput(tableName));

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
            form: {},
            authorization: "",
          },
        },
      });

    // Attempt re-creating metadata with the same name
    await request(app.getHttpServer())
      .put(`/metadata/resource/${resourceName}`)
      .expect(409)
      .expect((r) => r.body.message === "Item already exists");
  });

  it("Can add a new form", async () =>
    await request(app.getHttpServer())
      .put(`/metadata/form`)
      .send({
        schema: JSON.stringify({
          type: "object",
          properties: {
            key: {
              type: "string",
            },
          },
          required: ["key"],
        }),
      })
      .expect(200)
      .expect((r) => expect(r.body).toHaveProperty("id"))
      .expect((r) => expect(r.body.created).toBe(true)));

  it("Can't add a form with an invalid schema", () =>
    request(app.getHttpServer())
      .put(`/metadata/form`)
      .send({
        schema: JSON.stringify(11),
      })
      .expect(400));

  it("Creates metadata with a form", async () => {
    const resourceName = generateResourceName();

    // Create empty metadata
    await request(app.getHttpServer()).put(`/metadata/resource/${resourceName}`).expect(200).expect({ created: true });

    // Add a form
    type TestFormType = { stringKey: string; numberKey: number };
    const formSchema: JSONSchemaType<TestFormType> = {
      type: "object",
      properties: {
        stringKey: {
          type: "string",
        },
        numberKey: {
          type: "number",
        },
      },
      required: ["stringKey", "numberKey"],
    };
    const formId = await request(app.getHttpServer())
      .put(`/metadata/form`)
      .send({
        schema: JSON.stringify(formSchema),
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
          },
        },
      })
      .expect(201)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));
  });
});

describe("Resource module", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp([DynamodbModule, MetadataModule, ResourceModule]);
  });

  it("Can CRUD a resource", async () => {
    const resourceName = generateResourceName();
    const resourceData = {
      key: "test",
    };

    // Create empty metadata
    await request(app.getHttpServer()).put(`/metadata/resource/${resourceName}`).expect(200).expect({ created: true });

    // Create resource
    const resourceId = await request(app.getHttpServer())
      .put(`/resource/${resourceName}`)
      .send({
        data: resourceData,
      })
      .expect(200)
      .expect((r) => expect(r.body.Data).toEqual(resourceData))
      .then((r) => r.body.Id);

    // Read resource
    await request(app.getHttpServer())
      .get(`/resource/${resourceName}/${resourceId}`)
      .expect(200)
      .expect((r) => expect(r.body.Data).toEqual(resourceData));

    // Update resource
    const updatedResourceData = {
      key: "updated",
    };
    await request(app.getHttpServer())
      .post(`/resource/${resourceName}/${resourceId}`)
      .send({
        data: updatedResourceData,
      })
      .expect(201)
      .expect((r) => expect(r.body.Data).toEqual(updatedResourceData));

    // Read updated resource
    await request(app.getHttpServer())
      .get(`/resource/${resourceName}/${resourceId}`)
      .expect(200)
      .expect((r) => expect(r.body.Data).toEqual(updatedResourceData));

    // Delete resource
    await request(app.getHttpServer()).delete(`/resource/${resourceName}/${resourceId}`).expect(200);

    // Read deleted resource
    await request(app.getHttpServer()).get(`/resource/${resourceName}/${resourceId}`).expect(404);
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
