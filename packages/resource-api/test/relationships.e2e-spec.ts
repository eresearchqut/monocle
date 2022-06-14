import { INestApplication } from "@nestjs/common";
import { generateResourceName, initApp, teardownApp } from "./utils";
import * as request from "supertest";
import { Form, InputType, SectionType } from "@eresearchqut/form-definition";
import { NIL as NIL_UUID, v4 as uuid } from "uuid";
import { range } from "lodash";
import { ResourceModule } from "../src/module/resource/resource.module";

describe("Resource relationships", () => {
  let app: INestApplication;
  let initialSourceResource: string;
  let initialTargetResource: string;
  let initialSourceIds: Set<string> = new Set();
  let initialTargetIds: string[];

  let updatedSourceResource: string;
  let updatedTargetResource: string;
  let updatedSourceIds: Set<string> = new Set();
  let updatedTargetIds: string[];

  const createTestResources = async () => {
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
      .post(`/meta/relationships`)
      .send({
        relationships: {
          singleRelationship: {
            resource: targetResource,
            key: "testSection.targetKey1",
            dataKey: "",
          },
          multipleRelationship: {
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
          relationshipsVersion: sourceRelationshipsId,
          constraintsVersion: NIL_UUID,
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
          relationshipsVersion: NIL_UUID,
          constraintsVersion: NIL_UUID,
        },
      })
      .expect(200)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));

    // Create target resources
    const targetResourceIds = await Promise.all(
      range(2).map(async () =>
        request(app.getHttpServer())
          .post(`/resource/${targetResource}`)
          .send({
            data: {
              testSection: {
                targetValue: "Target",
              },
            },
          })
          .expect(201)
          .then((r) => r.body.Id)
      )
    );
    const [targetResourceId1, targetResourceId2] = targetResourceIds;

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

    return { sourceResource, targetResource, sourceResourceIds, targetResourceIds };
  };

  const requestRelationships = async (
    sourceResource: string,
    targetResource: string,
    relationship: string,
    targetResourceId: string,
    length: number,
    sourceResourceIds: Set<string>
  ) =>
    request(app.getHttpServer())
      .get(`/resource/${targetResource}/${targetResourceId}/${relationship}/${sourceResource}`)
      .expect(200)
      .then((r) => {
        expect(r.body.length).toEqual(length);
        expect(new Set(r.body.map((resource: { Id: string }) => resource.Id))).toEqual(sourceResourceIds);
      });

  beforeAll(async () => {
    const init = await initApp({ modules: [ResourceModule] });
    app = init.app;

    // Create initial resources
    ({
      sourceResource: initialSourceResource,
      targetResource: initialTargetResource,
      sourceResourceIds: initialSourceIds,
      targetResourceIds: initialTargetIds,
    } = await createTestResources());

    // Create same resources then apply changes
    let resourceIds;
    ({
      sourceResource: updatedSourceResource,
      targetResource: updatedTargetResource,
      sourceResourceIds: resourceIds,
      targetResourceIds: updatedTargetIds,
    } = await createTestResources());

    const [firstResource, secondResource, ...remainingResources] = resourceIds;
    updatedSourceIds = new Set(remainingResources);

    // Delete first source resource
    await request(app.getHttpServer()).delete(`/resource/${updatedSourceResource}/${firstResource}`).expect(200);

    // Update second source resource
    await request(app.getHttpServer())
      .put(`/resource/${updatedSourceResource}/${secondResource}`)
      .send({
        data: {
          testSection: {
            targetKey1: "",
            targetKey2: "",
          },
        },
        version: 1,
      })
      .expect(200);
  });

  afterAll(async () => teardownApp(app));

  // TODO: no relationships

  describe("Single relationship", () => {
    test("Initial resource", async () =>
      requestRelationships(
        initialSourceResource,
        initialTargetResource,
        "singleRelationship",
        initialTargetIds[0],
        5,
        initialSourceIds
      ));
    test("Updated resource", async () =>
      requestRelationships(
        updatedSourceResource,
        updatedTargetResource,
        "singleRelationship",
        updatedTargetIds[0],
        3,
        updatedSourceIds
      ));
  });

  describe("Multiple relationship", () => {
    test.each([1, 2])("Initial resource %i", async (targetIndex) =>
      requestRelationships(
        initialSourceResource,
        initialTargetResource,
        "multipleRelationship",
        Array.from(initialTargetIds)[targetIndex - 1],
        5,
        initialSourceIds
      )
    );
    test.each([1, 2])("Updated resource %i", async (targetIndex) =>
      requestRelationships(
        updatedSourceResource,
        updatedTargetResource,
        "multipleRelationship",
        Array.from(updatedTargetIds)[targetIndex - 1],
        3,
        updatedSourceIds
      )
    );
  });
});
