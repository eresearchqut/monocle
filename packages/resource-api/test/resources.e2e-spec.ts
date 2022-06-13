import { INestApplication } from "@nestjs/common";
import { generateResourceName, initApp, teardownApp } from "./utils";
import { ResourceModule } from "../src/module/resource/resource.module";
import * as request from "supertest";
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
  SampleContainerInput,
} from "@eresearchqut/form-definition";
import { match } from "ts-pattern";
import { NIL as NIL_UUID, v4 as uuid } from "uuid";
import { range } from "lodash";

describe("Resource forms", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const init = await initApp({ modules: [ResourceModule] });
    app = init.app;
  });

  afterAll(async () => teardownApp(app));

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
        version: 1,
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
        .with(InputType.SAMPLE_CONTAINER, (t): { input: SampleContainerInput; values: any[] } => ({
          input: {
            name: "sampleContainer",
            label: "SAMPLE_CONTAINER",
            id: uuid(),
            required: true,
            type: t,
          },
          values: [
            { width: 0, length: 0, samples: [] },
            {
              width: 8,
              length: 8,
              samples: [
                {
                  row: 2,
                  col: 4,
                  id: "abc123",
                  highlighted: true,
                },
              ],
            },
          ],
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
          relationshipsVersion: NIL_UUID,
          constraintsVersion: NIL_UUID,
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
    await Promise.all(
      range(1, 3).map((version) =>
        request(app.getHttpServer())
          .put(`/resource/${resourceName}/${resourceId}`)
          .send({
            data: {
              key: "test",
            },
            version,
          })
          .expect(404)
      )
    );

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
          relationshipsVersion: NIL_UUID,
          constraintsVersion: NIL_UUID,
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
