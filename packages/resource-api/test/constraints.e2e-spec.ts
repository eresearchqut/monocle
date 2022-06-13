import { HttpStatus, INestApplication } from "@nestjs/common";
import { generateResourceName, initApp } from "./utils";
import { ResourceModule } from "../src/module/resource/resource.module";
import * as request from "supertest";
import { Form, InputType, SectionType } from "@eresearchqut/form-definition";
import { NIL as NIL_UUID, v4 as uuid } from "uuid";

describe.only("Resource constraints", () => {
  let app: INestApplication;
  let formId: string;

  const createMetadataWithConstraints = async (constraints: string[][]) => {
    // Add constraints
    const constraintId = await request(app.getHttpServer())
      .post(`/meta/constraints`)
      .send({
        constraints: constraints.map((keys, index) => ({ name: `constraint${index}`, keys })),
      })
      .expect(201)
      .then((res) => res.body.id);

    // Create empty metadata
    const resource = generateResourceName();
    await request(app.getHttpServer()).post(`/meta/metadata/${resource}`).expect(201).expect({ created: true });

    // Create metadata v1.0.0
    await request(app.getHttpServer())
      .put(`/meta/metadata/${resource}?validation=validate`)
      .send({
        version: "1.0.0",
        schemas: {
          formVersion: formId,
          authorizationVersion: NIL_UUID,
          relationshipsVersion: NIL_UUID,
          constraintsVersion: constraintId,
        },
      })
      .expect(200)
      .expect((r) => expect(r.body.pushed).toBe(true))
      .expect((r) => expect(r.body.validation.lastVersion).toBe("0.0.0"));

    return resource;
  };

  const countResource = async (resource: string) =>
    request(app.getHttpServer())
      .get(`/resource/${resource}`)
      .expect(200)
      .then((res) => res.body.length);

  const addResource = async <T extends HttpStatus>(input: {
    resourceName: string;
    data: any;
    status: T;
    expectedCount: number;
  }): Promise<T extends HttpStatus.CREATED ? string : undefined> =>
    await request(app.getHttpServer())
      .post(`/resource/${input.resourceName}`)
      .send({ data: input.data })
      .expect(input.status)
      .then(async (res) => {
        expect(await countResource(input.resourceName)).toBe(input.expectedCount);
        return input.status === HttpStatus.CREATED ? res.body.Id : undefined;
      });

  const updateResource = async (input: {
    resourceName: string;
    resourceId: string;
    data: any;
    version: number;
    status: HttpStatus;
    expectedCount: number;
  }): Promise<void> =>
    await request(app.getHttpServer())
      .put(`/resource/${input.resourceName}/${input.resourceId}`)
      .send({ data: input.data, version: input.version })
      .expect(input.status)
      .then(async () => {
        expect(await countResource(input.resourceName)).toBe(input.expectedCount);
      });

  const deleteResources = async (input: {
    resourceName: string;
    resourceIds: string[];
    expectedCount: number;
  }): Promise<void> =>
    Promise.all(
      input.resourceIds.map((resourceId) =>
        request(app.getHttpServer()).delete(`/resource/${input.resourceName}/${resourceId}`).expect(HttpStatus.OK)
      )
    ).then(async () => {
      expect(await countResource(input.resourceName)).toBe(input.expectedCount);
    });

  beforeAll(async () => {
    const init = await initApp({ modules: [ResourceModule] });
    app = init.app;

    // Add form
    const formDefinition: Form = {
      name: "TestForm",
      description: "Test Form Description",
      sections: [
        {
          name: "section",
          label: "Test Section",
          description: "Test Section Description",
          id: NIL_UUID,
          type: SectionType.DEFAULT,
          inputs: [
            {
              name: "key1",
              label: "String constraint 1",
              description: "Constraint",
              type: InputType.TEXT,
              id: uuid(),
              required: false,
            },
            {
              name: "key2",
              label: "String constraint 2",
              description: "Constraint",
              type: InputType.TEXT,
              id: uuid(),
              required: false,
            },
            {
              name: "key3",
              label: "String constraint 3",
              description: "Constraint",
              type: InputType.TEXT,
              id: uuid(),
              required: false,
            },
            {
              name: "key4",
              label: "String constraint 4",
              description: "Constraint",
              type: InputType.TEXT,
              id: uuid(),
              required: false,
            },
            {
              name: "key5",
              label: "Numeric constraint",
              description: "Constraint",
              type: InputType.NUMERIC,
              id: uuid(),
              required: false,
            },
            {
              name: "key6",
              label: "Boolean constraint",
              description: "Constraint",
              type: InputType.BOOLEAN,
              id: uuid(),
              required: false,
            },
          ],
        },
      ],
    };
    formId = await request(app.getHttpServer())
      .post(`/meta/form`)
      .send({
        definition: formDefinition,
      })
      .expect(201)
      .then((res) => res.body.id);
  });

  // TODO: no constraints

  describe("Single constraint", () => {
    test("Single key", async () => {
      const resourceName = await createMetadataWithConstraints([["section.key1"]]);
      expect(await countResource(resourceName)).toBe(0);

      // Add resource
      const resourceId = await addResource({
        resourceName,
        data: { section: { key1: "test1" } },
        status: HttpStatus.CREATED,
        expectedCount: 1,
      });

      // Attempt adding resource with same constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test1" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });

      // Update existing resource
      await updateResource({
        resourceName,
        resourceId,
        data: { section: { key1: "test2" } },
        version: 1,
        status: HttpStatus.OK,
        expectedCount: 1,
      });

      // Attempt adding resource with same updated constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test2" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });

      // Add resource with original constraint value
      const secondResourceId = await addResource({
        resourceName,
        data: { section: { key1: "test1" } },
        status: HttpStatus.CREATED,
        expectedCount: 2,
      });

      // Delete existing resources
      await deleteResources({
        resourceName,
        resourceIds: [resourceId, secondResourceId],
        expectedCount: 0,
      });

      // Add resource with original constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test1" } },
        status: HttpStatus.CREATED,
        expectedCount: 1,
      });

      // Add resource with updated constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test2" } },
        status: HttpStatus.CREATED,
        expectedCount: 2,
      });
    });

    test("Multiple keys", async () => {
      const resourceName = await createMetadataWithConstraints([["section.key1", "section.key2"]]);
      expect(await countResource(resourceName)).toBe(0);

      // Add resource
      const resourceId = await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2" } },
        status: HttpStatus.CREATED,
        expectedCount: 1,
      });

      // Attempt adding resource with same constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });

      // Update existing resource
      await updateResource({
        resourceName,
        resourceId,
        data: { section: { key1: "test3", key2: "test4" } },
        version: 1,
        status: HttpStatus.OK,
        expectedCount: 1,
      });

      // Attempt adding resource with same updated constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test3", key2: "test4" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });

      // Add resource with original constraint value
      const secondResourceId = await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2" } },
        status: HttpStatus.CREATED,
        expectedCount: 2,
      });

      // Delete existing resources
      await deleteResources({
        resourceName,
        resourceIds: [resourceId, secondResourceId],
        expectedCount: 0,
      });

      // Add resource with original constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2" } },
        status: HttpStatus.CREATED,
        expectedCount: 1,
      });

      // Attempt adding resources with different constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test3" } },
        status: HttpStatus.CREATED,
        expectedCount: 2,
      });
      await addResource({
        resourceName,
        data: { section: { key1: "test3", key2: "test4" } },
        status: HttpStatus.CREATED,
        expectedCount: 3,
      });
    });
  });

  describe("Multiple constraints", () => {
    test("Single key", async () => {
      const resourceName = await createMetadataWithConstraints([["section.key1"], ["section.key2"]]);
      expect(await countResource(resourceName)).toBe(0);

      // Add resource
      const resourceId = await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2" } },
        status: HttpStatus.CREATED,
        expectedCount: 1,
      });

      // Attempt adding resource with one of the same constraint values
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test3" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });
      await addResource({
        resourceName,
        data: { section: { key1: "test3", key2: "test2" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });

      // Update existing resource
      await updateResource({
        resourceName,
        resourceId,
        data: { section: { key1: "test3", key2: "test4" } },
        version: 1,
        status: HttpStatus.OK,
        expectedCount: 1,
      });

      // Attempt adding resource with one of the same updated constraint values
      await addResource({
        resourceName,
        data: { section: { key1: "test3", key2: "test2" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test4" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });
      await addResource({
        resourceName,
        data: { section: { key1: "test3", key2: "test4" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });

      // Add resource with original constraint value
      const secondResourceId = await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2" } },
        status: HttpStatus.CREATED,
        expectedCount: 2,
      });

      // Delete existing resources
      await deleteResources({
        resourceName,
        resourceIds: [resourceId, secondResourceId],
        expectedCount: 0,
      });

      // Add resource with original constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2" } },
        status: HttpStatus.CREATED,
        expectedCount: 1,
      });

      // Add resource with updated constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test3", key2: "test4" } },
        status: HttpStatus.CREATED,
        expectedCount: 2,
      });
    });

    test("Multiple keys", async () => {
      const resourceName = await createMetadataWithConstraints([
        ["section.key1", "section.key2"],
        ["section.key3", "section.key4"],
      ]);
      expect(await countResource(resourceName)).toBe(0);

      // Add resource
      const resourceId = await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2", key3: "key3", key4: "key4" } },
        status: HttpStatus.CREATED,
        expectedCount: 1,
      });

      // Attempt adding resource with one of the same constraint values
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2", key3: "key3", key4: "key4" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test5", key3: "key3", key4: "key4" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2", key3: "key5", key4: "key4" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });

      // Update existing resource
      await updateResource({
        resourceName,
        resourceId,
        data: { section: { key1: "test5", key2: "test6", key3: "key7", key4: "key8" } },
        version: 1,
        status: HttpStatus.OK,
        expectedCount: 1,
      });

      // Attempt adding resource with one of the same updated constraint values
      await addResource({
        resourceName,
        data: { section: { key1: "test5", key2: "test6", key3: "key1", key4: "key2" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2", key3: "key7", key4: "key8" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });
      await addResource({
        resourceName,
        data: { section: { key1: "test5", key2: "test6", key3: "key7", key4: "key8" } },
        status: HttpStatus.CONFLICT,
        expectedCount: 1,
      });

      // Add resource with original constraint value
      const secondResourceId = await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2", key3: "key3", key4: "key4" } },
        status: HttpStatus.CREATED,
        expectedCount: 2,
      });

      // Delete existing resources
      await deleteResources({
        resourceName,
        resourceIds: [resourceId, secondResourceId],
        expectedCount: 0,
      });

      // Add resource with original constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test1", key2: "test2", key3: "key3", key4: "key4" } },
        status: HttpStatus.CREATED,
        expectedCount: 1,
      });

      // Add resource with updated constraint value
      await addResource({
        resourceName,
        data: { section: { key1: "test5", key2: "test6", key3: "key7", key4: "key8" } },
        status: HttpStatus.CREATED,
        expectedCount: 2,
      });
    });
  });
});
