import { Injectable } from "@nestjs/common";
import { TransformPlainToClass } from "class-transformer";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "src/app.config";
import { MetadataException } from "./metadata.exception";
import {
  ConditionallyValidateClassAsync,
  ConditionallyValidateClassAsyncGenerator,
} from "src/decorator/validate.decorator";
import { DynamodbService } from "../dynamodb/dynamodb.service";
import { DEFAULT_GROUP_NAME, Metadata, MetadataEntityType } from "./metadata.entity";
import { v4 as uuidV4, NIL as NIL_UUID } from "uuid";
import { MetadataForm, MetaDataFormType } from "./form.entity";
import { MetadataAuthorization, MetadataAuthorizationType } from "./authorization.entity";
import { gte as semverGte, eq as semverEq, SemVer } from "semver";
import { diffSchemas } from "json-schema-diff";
import { from as ixFrom } from "ix/asynciterable";
import "ix/add/asynciterable-operators/find";
import "ix/add/asynciterable-operators/map";
import { match } from "ts-pattern";
import { TransformAsyncGeneratorPlainToClass } from "../../decorator/transform.decorator";
import Ajv from "ajv";

const INITIAL_SEMVER = "0.0.0";

const EMPTY_FORM: MetaDataFormType = {
  ...buildFormItemKey(NIL_UUID),
  Id: NIL_UUID,
  ItemType: "Form",
  CreatedAt: new Date().toISOString(),
  CreatedBy: "system",
  Data: {
    Schema: "{}",
  },
};

const EMPTY_AUTHORIZATION: MetadataAuthorizationType = {
  ...buildFormItemKey(NIL_UUID),
  Id: NIL_UUID + "a",
  ItemType: "Authorization",
  CreatedAt: new Date().toISOString(),
  CreatedBy: "system",
  Data: {
    Policy: "",
  },
};

function buildMetadataItemKey(resource: string, version?: string) {
  const key = `Resource:${resource}#data:${resource}`;
  return { PK: key, SK: `${key}${version !== undefined ? `:${version}` : ""}` };
}

function buildFormItemKey(form: string) {
  const key = `Form:${form}`;
  return { PK: key, SK: key };
}

function buildAuthorizationItemKey(authorization: string) {
  const key = `Authorization:${authorization}`;
  return { PK: key, SK: key };
}

interface PutMetadataInput {
  version: string;
  metadata: Metadata;
}

type MetadataProperties = {
  resource: string;
  version: string;
  groups: { [groupName: string]: { formVersion: string; authorizationVersion: string } };
};

type SchemaDiffResult =
  | {
      valid: true;
      message: string;
    }
  | {
      valid: false;
      message: string;
      addedSchema?: any;
      removedSchema?: any;
    };

interface ValidationResult {
  valid: boolean;
  message?: string;
  lastVersion?: string;
  results?: { [groupName: string]: SchemaDiffResult };
}

@Injectable()
export class MetadataService {
  private validateOnRead: boolean;
  private validateOnWrite: boolean;

  constructor(public configService: ConfigService<AppConfig, true>, private dynamodbService: DynamodbService) {
    this.validateOnRead = configService.get("VALIDATE_METADATA_ON_READ");
    this.validateOnWrite = configService.get("VALIDATE_METADATA_ON_WRITE");
  }

  async addMetadata(resource: string): Promise<boolean> {
    const key = buildMetadataItemKey(resource);
    return this.dynamodbService
      .putVersionedItem<MetadataEntityType>({
        table: this.configService.get("RESOURCE_TABLE"),
        lastVersion: INITIAL_SEMVER,
        nextVersion: INITIAL_SEMVER,
        item: {
          ...key,
          Id: resource,
          ItemType: "Metadata",
          CreatedAt: new Date().toISOString(),
          CreatedBy: "system",
          Data: {
            Resource: resource,
            Version: INITIAL_SEMVER,
            Groups: {
              [DEFAULT_GROUP_NAME]: {
                formVersion: NIL_UUID,
                authorizationVersion: NIL_UUID,
              },
            },
          },
        },
      })
      .then(() => true)
      .catch((err) => (err.code === "ConditionalCheckFailed" ? false : Promise.reject(err)));
  }

  async pushMetadataVersion(data: MetadataProperties, validation: "none"): Promise<{ pushed: boolean }>;
  async pushMetadataVersion(
    data: MetadataProperties,
    validation: "validate"
  ): Promise<{ pushed: boolean; validation: SchemaDiffResult }>;
  async pushMetadataVersion(
    data: MetadataProperties,
    validation: "none" | "validate"
  ): Promise<{ pushed: boolean; validation?: ValidationResult }> {
    const validationResult = validation === "validate" ? await this.validateMetadataVersion(data) : undefined;
    if (validationResult?.valid === false) {
      return {
        pushed: false,
        validation: validationResult,
      };
    }

    const latest = await this.getMetadata(data.resource);
    const key = buildMetadataItemKey(data.resource);
    return this.dynamodbService
      .putVersionedItem<MetadataEntityType>({
        table: this.configService.get("RESOURCE_TABLE"),
        lastVersion: latest.Data.Version,
        nextVersion: data.version,
        item: {
          ...key,
          Id: data.resource,
          ItemType: "Metadata",
          CreatedAt: new Date().toISOString(),
          CreatedBy: "system",
          Data: {
            Resource: data.resource,
            Version: data.version,
            Groups: data.groups,
          },
        },
      })
      .then(() => ({ pushed: true, validation: validationResult }))
      .catch((err) => {
        if (err.code === "ConditionalCheckFailed") {
          return { pushed: false, validation: validationResult };
        } else {
          return Promise.reject(err);
        }
      });
  }

  @ConditionallyValidateClassAsync("VALIDATE_METADATA_ON_READ")
  @TransformPlainToClass(Metadata)
  public async getMetadata(resource: string, version = "latest"): Promise<Metadata> {
    const key = buildMetadataItemKey(resource, version);
    const item = await this.dynamodbService.getItem<Metadata>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });
    if (item === null) {
      throw new MetadataException(`Failed to retrieve metadata for resource: ${resource} (${version})`);
    }
    return item;
  }

  @ConditionallyValidateClassAsyncGenerator("VALIDATE_METADATA_ON_READ")
  @TransformAsyncGeneratorPlainToClass(Metadata)
  public async *queryMetadata(resource: string): AsyncGenerator<Metadata> {
    const key = buildMetadataItemKey(resource);
    yield* this.dynamodbService.queryItems<Metadata>({
      table: this.configService.get("RESOURCE_TABLE"),
      keyCondition: "#PK = :PK and begins_with(#SK, :SKPrefix)",
      expressionNames: {
        "#PK": "PK",
        "#SK": "SK",
      },
      expressionValues: {
        ":PK": key.PK,
        ":SKPrefix": key.SK,
      },
    });
  }

  private async validateMetadataVersion(newMetadata: MetadataProperties): Promise<ValidationResult> {
    // Waiting for https://github.com/tc39/proposal-iterator-helpers#findfn :(
    const lastVersion = await ixFrom(this.queryMetadata(newMetadata.resource))
      .find({
        predicate: (oldVersion) => semverGte(newMetadata.version, oldVersion.Data.Version),
      })
      .then((oldVersion) => oldVersion?.Data.Version);
    if (lastVersion === undefined) {
      return {
        valid: false,
        message: "No previous schema versions found",
      };
    } else if (semverEq(newMetadata.version, lastVersion)) {
      return {
        valid: false,
        message: "New schema has an equivalent version to an existing schema",
        lastVersion,
      };
    } else {
      const [oldSemver, newSemver] = [lastVersion, newMetadata.version].map((version) => new SemVer(version));
      const oldMetadata = await this.getMetadata(newMetadata.resource, oldSemver.raw);
      const oldGroups = oldMetadata.Data.Groups;
      const newGroups = newMetadata.groups;
      const majorBump = oldSemver.major < newSemver.major;

      if (!majorBump && Object.keys(oldGroups).some((group) => newGroups[group] === undefined)) {
        return {
          valid: majorBump,
          message: "Groups found in previous version that have been removed",
          lastVersion,
        };
      }

      const expected = majorBump ? "incompatible" : "compatible";
      const diffs = await Promise.all(
        Object.entries(oldGroups).map(async ([oldGroup, oldGroupData]) => {
          const [oldForm, newForm] = await Promise.all([
            this.getForm(oldGroupData.formVersion),
            this.getForm(newGroups[oldGroup].formVersion),
          ]);
          return {
            group: oldGroup,
            diff: await this.diffSchemas(oldForm.getSchema(), newForm.getSchema(), expected),
          };
        })
      );

      const invalid = diffs.filter(({ diff }) => !diff.valid);
      return {
        valid: invalid.length === 0,
        message: `${invalid.length} invalid schemas found`,
        lastVersion,
        results: Object.fromEntries(diffs.map(({ group, diff }) => [group, diff])),
      };
    }
  }

  private async diffSchemas(
    oldSchema: any,
    newSchema: any,
    expected: "compatible" | "incompatible"
  ): Promise<SchemaDiffResult> {
    const diff = await diffSchemas({
      sourceSchema: oldSchema,
      destinationSchema: newSchema,
    });

    return match({ expected, diff })
      .with({ diff: { removalsFound: false, additionsFound: false } }, () => ({
        valid: false,
        message: "No differences found with previous version",
      }))
      .with({ expected: "incompatible", diff: { removalsFound: true } }, () => ({
        valid: true,
        message: "Schema is incompatible with previous version, requiring a major bump",
      }))
      .with({ expected: "incompatible", diff: { removalsFound: false } }, () => ({
        valid: false,
        message: "Schema is compatible with previous version.",
        addedSchema: diff.addedJsonSchema,
        removedSchema: diff.removedJsonSchema,
      }))
      .with({ expected: "compatible", diff: { additionsFound: true } }, () => ({
        valid: true,
        message: "Schema is compatible with previous version, requiring a minor bump",
      }))
      .with({ expected: "compatible", diff: { additionsFound: false } }, () => ({
        valid: false,
        message: "Schema is incompatible with previous version, requiring a major bump",
        addedSchema: diff.addedJsonSchema,
        removedSchema: diff.removedJsonSchema,
      }))
      .exhaustive();
  }

  public async putMetadata(input: PutMetadataInput): Promise<void> {
    const key = buildMetadataItemKey(input.metadata.Id, input.version);
    await this.dynamodbService.putItem<MetadataEntityType>({
      table: this.configService.get("RESOURCE_TABLE"),
      item: {
        ...key,
        ...input.metadata,
      },
    });
  }

  @ConditionallyValidateClassAsync("VALIDATE_METADATA_ON_READ")
  @TransformPlainToClass(MetadataForm)
  public async getForm(form: string): Promise<MetadataForm> {
    if (form === NIL_UUID) {
      // Must cast to MetadataForm because transform decorator cannot change method signature
      return EMPTY_FORM as MetadataForm;
    }

    const key = buildFormItemKey(form);

    const item = await this.dynamodbService.getItem<MetadataForm>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });
    if (item === null) {
      throw new MetadataException(`Failed to retrieve form ${form}`);
    }
    return item;
  }

  public async putForm(schema: string): Promise<{ created: false }>;
  public async putForm(schema: string): Promise<{ created: true; id: string }>;
  public async putForm(schema: string): Promise<{ created: boolean; id?: string }> {
    try {
      const ajv = new Ajv();
      ajv.compile(JSON.parse(schema));
    } catch (e) {
      return { created: false };
    }
    const id = uuidV4();
    const key = buildFormItemKey(id);
    return this.dynamodbService
      .putItem<MetaDataFormType>({
        table: this.configService.get("RESOURCE_TABLE"),
        overwrite: false,
        item: {
          ...key,
          Id: id,
          ItemType: "Form",
          CreatedAt: new Date().toISOString(),
          CreatedBy: "system",
          Data: {
            Schema: schema,
          },
        },
      })
      .then(() => ({ created: true, id: id }))
      .catch((err) => (err.code === "ConditionalCheckFailed" ? { created: false } : Promise.reject(err)));
  }

  @ConditionallyValidateClassAsync("VALIDATE_METADATA_ON_READ")
  @TransformPlainToClass(MetadataAuthorization)
  public async getAuthorization(policy: string): Promise<MetadataAuthorization> {
    if (policy === NIL_UUID) {
      // Must cast to MetadataAuthorization because transform decorator cannot change method signature
      return EMPTY_AUTHORIZATION as MetadataAuthorization;
    }

    const key = buildAuthorizationItemKey(policy);

    const item = await this.dynamodbService.getItem<MetadataAuthorization>({
      table: this.configService.get("RESOURCE_TABLE"),
      ...key,
    });
    if (item === null) {
      throw new MetadataException(`Failed to retrieve authorization policy for resource ${policy}`);
    }
    return item;
  }

  public async putAuthorization(policy: string): Promise<boolean> {
    const id = uuidV4();
    const key = buildAuthorizationItemKey(id);
    return this.dynamodbService
      .putItem<MetadataAuthorizationType>({
        table: this.configService.get("RESOURCE_TABLE"),
        overwrite: false,
        item: {
          ...key,
          Id: id,
          ItemType: "Authorization",
          CreatedAt: new Date().toISOString(),
          CreatedBy: "system",
          Data: {
            Policy: policy,
          },
        },
      })
      .then(() => true)
      .catch((err) => (err.code === "ConditionalCheckFailed" ? false : Promise.reject(err)));
  }
}
