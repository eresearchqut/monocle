import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { NIL as NIL_UUID, v4 as uuid } from "uuid";
import { DynamodbModule } from "../src/module/dynamodb/dynamodb.module";
import { MetadataModule } from "../src/module/meta/metadata/metadata.module";
import { Form, InputType, SectionType } from "@eresearchqut/form-definition";
import { FormModule } from "../src/module/meta/form/form.module";
import { ProjectionsModule } from "../src/module/meta/projections/projections.module";
import { AuthorizationModule } from "../src/module/meta/authorization/authorization.module";
import { generateResourceName, initApp, teardownApp } from "./utils";

describe("Metadata", () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp([DynamodbModule, MetadataModule, FormModule, ProjectionsModule, AuthorizationModule]);
  });

  afterAll(async () => teardownApp(app));

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
