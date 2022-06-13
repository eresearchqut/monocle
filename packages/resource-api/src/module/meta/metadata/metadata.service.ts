import { Injectable } from "@nestjs/common";
import { TransformPlainToClass } from "class-transformer";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "src/app.config";
import { MetadataException } from "./metadata.exception";
import {
  ConditionallyValidateClassAsync,
  ConditionallyValidateClassAsyncGenerator,
} from "src/decorator/validate.decorator";
import { DynamodbService } from "../../dynamodb/dynamodb.service";
import { Metadata, MetadataEntityType } from "./metadata.entity";
import { NIL as NIL_UUID } from "uuid";
import { eq as semverEq, gte as semverGte, SemVer } from "semver";
import { diffSchemas } from "json-schema-diff";
import { from as ixFrom } from "ix/asynciterable";
import "ix/add/asynciterable-operators/find";
import "ix/add/asynciterable-operators/map";
import { match } from "ts-pattern";
import { TransformAsyncGeneratorPlainToClass } from "../../../decorator/transform.decorator";
import { SYSTEM_USER } from "../constants";
import { FormService } from "../form/form.service";
import { INITIAL_SEMVER } from "./metadata.constants";

function buildMetadataItemKey(resource: string, version?: string) {
  const key = `Resource:${resource}#metadata:${resource}`; // TODO: ban 'meta' & 'metadata' as a resource type
  return { PK: key, SK: `${key}${version !== undefined ? `:${version}` : ""}` };
}

interface PutMetadataInput {
  version: string;
  metadata: Metadata;
}

type MetadataProperties = {
  resource: string;
  version: string;
  schemas: {
    formVersion: string;
    authorizationVersion: string;
    relationshipsVersion: string;
    constraintsVersion: string;
  };
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
  results?: {
    message: string;
    addedSchema?: any;
    removedSchema?: any;
  };
}

@Injectable()
export class MetadataService {
  constructor(
    public configService: ConfigService<AppConfig, true>,
    private dynamodbService: DynamodbService,
    private formService: FormService
  ) {}

  async createMetadata(resource: string): Promise<boolean> {
    const key = buildMetadataItemKey(resource);
    return this.dynamodbService
      .putSemanticallyVersionedItem<MetadataEntityType>({
        table: this.configService.get("RESOURCE_TABLE"),
        lastVersion: INITIAL_SEMVER,
        nextVersion: INITIAL_SEMVER,
        item: {
          ...key,
          Id: resource,
          ItemType: "Metadata",
          CreatedAt: new Date().toISOString(),
          CreatedBy: SYSTEM_USER,
          Data: {
            Resource: resource,
            Version: INITIAL_SEMVER,
            Schemas: {
              FormVersion: NIL_UUID,
              AuthorizationVersion: NIL_UUID,
              RelationshipsVersion: NIL_UUID,
              ConstraintsVersion: NIL_UUID,
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
  ): Promise<{ pushed: boolean; validation: ValidationResult }>;
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
      .putSemanticallyVersionedItem<MetadataEntityType>({
        table: this.configService.get("RESOURCE_TABLE"),
        lastVersion: latest.Data.Version,
        nextVersion: data.version,
        item: {
          ...key,
          Id: data.resource,
          ItemType: "Metadata",
          CreatedAt: new Date().toISOString(),
          CreatedBy: SYSTEM_USER,
          Data: {
            Resource: data.resource,
            Version: data.version,
            Schemas: {
              FormVersion: data.schemas.formVersion,
              AuthorizationVersion: data.schemas.authorizationVersion,
              RelationshipsVersion: data.schemas.relationshipsVersion,
              ConstraintsVersion: data.schemas.constraintsVersion,
            },
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

      const [oldForm, newForm] = await Promise.all([
        this.formService.getForm(oldMetadata.Data.Schemas.FormVersion),
        this.formService.getForm(newMetadata.schemas.formVersion),
      ]);

      const majorBump = oldSemver.major < newSemver.major;
      const expected = majorBump ? "incompatible" : "compatible";
      const diff = await this.diffSchemas(oldForm.getSchema(), newForm.getSchema(), expected);

      return {
        valid: diff.valid,
        message: `Invalid schema difference found`,
        lastVersion,
        results: diff,
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
}
