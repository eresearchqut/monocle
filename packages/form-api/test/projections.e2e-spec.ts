import { INestApplication } from "@nestjs/common";
import { generateResourceName, initApp } from "./utils";
import * as request from "supertest";
import { Form, InputType, SectionType } from "@eresearchqut/form-definition";
import { NIL as NIL_UUID, v4 as uuid } from "uuid";
import { range } from "lodash";
import { ResourceModule } from "../src/module/resource/resource.module";

describe("Resource relationship projections", () => {
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
    app = await initApp([ResourceModule]);

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
      })
      .expect(200);
  });

  describe("Single index relationship", () => {
    const relationship = "indexRelationship";
    test("Initial resource", async () =>
      requestRelationships(
        initialSourceResource,
        initialTargetResource,
        relationship,
        initialTargetIds[0],
        5,
        initialSourceIds
      ));
    test("Updated resource", async () =>
      requestRelationships(
        updatedSourceResource,
        updatedTargetResource,
        relationship,
        updatedTargetIds[0],
        3,
        updatedSourceIds
      ));
  });

  describe("Single composite relationship", () => {
    const relationship = "singleCompositeRelationship";
    test("Initial resource", async () =>
      requestRelationships(
        initialSourceResource,
        initialTargetResource,
        relationship,
        initialTargetIds[0],
        5,
        initialSourceIds
      ));
    test("Updated resource", async () =>
      requestRelationships(
        updatedSourceResource,
        updatedTargetResource,
        relationship,
        updatedTargetIds[0],
        3,
        updatedSourceIds
      ));
  });

  describe("Multiple composite relationship", () => {
    const relationship = "multipleCompositeRelationship";
    test.each([1, 2])("Initial resource %i", async (targetIndex) =>
      requestRelationships(
        initialSourceResource,
        initialTargetResource,
        relationship,
        Array.from(initialTargetIds)[targetIndex - 1],
        5,
        initialSourceIds
      )
    );
    test.each([1, 2])("Updated resource %i", async (targetIndex) =>
      requestRelationships(
        updatedSourceResource,
        updatedTargetResource,
        relationship,
        Array.from(updatedTargetIds)[targetIndex - 1],
        3,
        updatedSourceIds
      )
    );
  });
});

describe("Resource sort projections", () => {
  let app: INestApplication;
  let initialResourceName: string;
  let updatedResourceName: string;

  const createTestResources = async () => {
    const resourceName = generateResourceName();
    await request(app.getHttpServer()).post(`/meta/metadata/${resourceName}`).expect(201).expect({ created: true });

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
      .put(`/meta/metadata/${resourceName}?validation=validate`)
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
          .post(`/resource/${resourceName}`)
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

    return { resourceName, resourceIds };
  };

  const requestSort = async (
    resource: string,
    projection: string,
    order: "reverse" | undefined,
    resultProperty: "index" | "even",
    expected: (number | boolean)[]
  ) =>
    request(app.getHttpServer())
      .get(`/resource/${resource}/projection/${projection}`)
      .query({ order })
      .expect(200)
      .then((r) => {
        expect(
          r.body.map((resource: any) =>
            resultProperty === "index" ? resource.Data.testSection.index : resource.Data.testSection.index % 2 === 0
          )
        ).toEqual(expected);
      });

  beforeAll(async () => {
    app = await initApp([ResourceModule]);

    // Create initial resources
    ({ resourceName: initialResourceName } = await createTestResources());

    // Create same resources then apply changes
    let resourceIds;
    ({ resourceName: updatedResourceName, resourceIds } = await createTestResources());

    const [firstResource, secondResource] = resourceIds;

    // Delete first resource
    await request(app.getHttpServer()).delete(`/resource/${updatedResourceName}/${firstResource}`).expect(200);

    // Update second resource
    await request(app.getHttpServer())
      .put(`/resource/${updatedResourceName}/${secondResource}`)
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
  });

  describe("String sorting", () => {
    describe("Initial resources", () => {
      const orderings: ["reverse" | undefined, number[]][] = [
        [undefined, [1, 2, 3, 4, 5]],
        ["reverse", [5, 4, 3, 2, 1]],
      ];
      describe("Index projection", () => {
        const projection = "stringIndexSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(initialResourceName, projection, order, "index", sorted)
        );
      });
      describe("Composite projection", () => {
        const projection = "stringCompositeSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(initialResourceName, projection, order, "index", sorted)
        );
      });
    });
    describe("Updated resources", () => {
      const orderings: ["reverse" | undefined, number[]][] = [
        [undefined, [1, 2, 4, 6]],
        ["reverse", [6, 4, 2, 1]],
      ];
      describe("Index projection", () => {
        const projection = "stringIndexSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(updatedResourceName, projection, order, "index", sorted)
        );
      });
      describe("Composite projection", () => {
        const projection = "stringCompositeSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(updatedResourceName, projection, order, "index", sorted)
        );
      });
    });
  });

  describe("Number sorting", () => {
    describe("Initial resources", () => {
      const orderings: ["reverse" | undefined, number[]][] = [
        [undefined, [1, 2, 3, 4, 5]],
        ["reverse", [5, 4, 3, 2, 1]],
      ];
      describe("Index projection", () => {
        const projection = "numberIndexSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(initialResourceName, projection, order, "index", sorted)
        );
      });
      describe("Composite projection", () => {
        const projection = "numberCompositeSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(initialResourceName, projection, order, "index", sorted)
        );
      });
    });
    describe("Updated resources", () => {
      const orderings: ["reverse" | undefined, number[]][] = [
        [undefined, [1, 2, 4, 6]],
        ["reverse", [6, 4, 2, 1]],
      ];
      describe("Index projection", () => {
        const projection = "numberIndexSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(updatedResourceName, projection, order, "index", sorted)
        );
      });
      describe("Composite projection", () => {
        const projection = "numberCompositeSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(updatedResourceName, projection, order, "index", sorted)
        );
      });
    });
  });

  describe("Boolean sorting", () => {
    describe("Initial resources", () => {
      const orderings: ["reverse" | undefined, boolean[]][] = [
        [undefined, [false, false, false, true, true]],
        ["reverse", [true, true, false, false, false]],
      ];
      describe("Index projection", () => {
        const projection = "booleanIndexSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(initialResourceName, projection, order, "even", sorted)
        );
      });
      describe("Composite projection", () => {
        const projection = "booleanCompositeSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(initialResourceName, projection, order, "even", sorted)
        );
      });
    });
    describe("Updated resources", () => {
      const orderings: ["reverse" | undefined, boolean[]][] = [
        [undefined, [false, true, true, true]],
        ["reverse", [true, true, true, false]],
      ];
      describe("Index projection", () => {
        const projection = "booleanIndexSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(updatedResourceName, projection, order, "even", sorted)
        );
      });
      describe("Composite projection", () => {
        const projection = "booleanCompositeSort";
        test.each(orderings)("Order: %s -> %s", async (order, sorted) =>
          requestSort(updatedResourceName, projection, order, "even", sorted)
        );
      });
    });
  });
});

describe("Resource query projections", () => {
  let app: INestApplication;
  let initialResourceName: string;
  let updatedResourceName: string;

  const createTestResources = async () => {
    const resourceName = generateResourceName();
    await request(app.getHttpServer()).post(`/meta/metadata/${resourceName}`).expect(201).expect({ created: true });

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
      .put(`/meta/metadata/${resourceName}?validation=validate`)
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
    const resourceIds = await Promise.all(
      inputValues.map(async ([s, n, b], i) =>
        request(app.getHttpServer())
          .post(`/resource/${resourceName}`)
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

    return { resourceName, resourceIds };
  };

  const requestQuery = async (
    resource: string,
    projection: string,
    query: string | number | boolean,
    queryType: string,
    expected: number[]
  ) =>
    request(app.getHttpServer())
      .get(`/resource/${resource}/projection/${projection}`)
      .query({ query, queryType })
      .expect(200)
      .then((r) => {
        expect(r.body.map((resource: any) => resource.Data.testSection.index).sort()).toEqual(expected);
      });

  beforeAll(async () => {
    app = await initApp([ResourceModule]);

    // Create initial resources
    ({ resourceName: initialResourceName } = await createTestResources());

    // Create same resources then apply changes
    let resourceIds;
    ({ resourceName: updatedResourceName, resourceIds } = await createTestResources());

    const [firstResource, secondResource] = resourceIds;

    // Delete first resource
    await request(app.getHttpServer()).delete(`/resource/${updatedResourceName}/${firstResource}`).expect(200);

    // Update second resource
    await request(app.getHttpServer())
      .put(`/resource/${updatedResourceName}/${secondResource}`)
      .send({
        data: {
          testSection: {
            index: 4,
            stringKey1: "ghi",
            stringKey2: "ghi",
            numberKey1: 789,
            numberKey2: 789,
            booleanKey1: true,
            booleanKey2: true,
          },
        },
      })
      .expect(200);
  });

  describe("String queries", () => {
    describe("Initial resources", () => {
      const queries: [string, string, number[]][] = [
        ["abc", "string", [0, 1]],
        ["def", "string", [2, 3]],
        ["ghi", "string", []],
      ];
      describe("Index projection", () => {
        const projection = "stringIndexQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(initialResourceName, projection, query, queryType, expected)
        );
      });
      describe("Composite projection", () => {
        const projection = "stringCompositeQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(initialResourceName, projection, query, queryType, expected)
        );
      });
    });
    describe("Updated resources", () => {
      const queries: [string, string, number[]][] = [
        ["abc", "string", []],
        ["def", "string", [2, 3]],
        ["ghi", "string", [4]],
      ];
      describe("Index projection", () => {
        const projection = "stringIndexQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(updatedResourceName, projection, query, queryType, expected)
        );
      });
      describe("Composite projection", () => {
        const projection = "stringCompositeQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(updatedResourceName, projection, query, queryType, expected)
        );
      });
    });
  });

  describe("Number queries", () => {
    describe("Initial resources", () => {
      const queries: [number, string, number[]][] = [
        [123, "number", [0, 2]],
        [456, "number", [1, 3]],
        [789, "number", []],
      ];
      describe("Index projection", () => {
        const projection = "numberIndexQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(initialResourceName, projection, query, queryType, expected)
        );
      });
      describe("Composite projection", () => {
        const projection = "numberCompositeQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(initialResourceName, projection, query, queryType, expected)
        );
      });
    });
    describe("Updated resources", () => {
      const queries: [number, string, number[]][] = [
        [123, "number", [2]],
        [456, "number", [3]],
        [789, "number", [4]],
      ];
      describe("Index projection", () => {
        const projection = "numberIndexQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(updatedResourceName, projection, query, queryType, expected)
        );
      });
      describe("Composite projection", () => {
        const projection = "numberCompositeQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(updatedResourceName, projection, query, queryType, expected)
        );
      });
    });
  });

  describe("Boolean queries", () => {
    describe("Initial resources", () => {
      const queries: [boolean, string, number[]][] = [
        [true, "boolean", [0, 3]],
        [false, "boolean", [1, 2]],
      ];
      describe("Index projection", () => {
        const projection = "booleanIndexQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(initialResourceName, projection, query, queryType, expected)
        );
      });
      describe("Composite projection", () => {
        const projection = "booleanCompositeQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(initialResourceName, projection, query, queryType, expected)
        );
      });
    });
    describe("Updated resources", () => {
      const queries: [boolean, string, number[]][] = [
        [true, "boolean", [3, 4]],
        [false, "boolean", [2]],
      ];
      describe("Index projection", () => {
        const projection = "booleanIndexQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(updatedResourceName, projection, query, queryType, expected)
        );
      });
      describe("Composite projection", () => {
        const projection = "booleanCompositeQuery";
        test.each(queries)("Query: %s (%s) -> %s", async (query, queryType, expected) =>
          requestQuery(updatedResourceName, projection, query, queryType, expected)
        );
      });
    });
  });
});
