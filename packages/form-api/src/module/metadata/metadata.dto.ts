import {
  Equals,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsPositive,
  IsSemVer,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from "class-validator";
import { form as FormSchema, Form } from "@eresearchqut/form-definition";
import { IsJsonSchema } from "src/decorator/validate.decorator";
import { Type } from "class-transformer";
import { RELATIONSHIP_TYPES } from "../constants";

abstract class ResourceParams {
  @Matches(/[a-zA-Z0-9_]+/)
  resource!: string;
}

abstract class OptionalSemverQuery {
  @IsOptional()
  @IsSemVer()
  version?: string;
}

export class GetMetadataParams extends ResourceParams {}

export class GetMetadataQuery extends OptionalSemverQuery {}

class GetMetadataResponseSchemas {
  @IsUUID()
  formVersion!: string;

  @IsUUID()
  authorizationVersion!: string;

  @IsUUID()
  relationshipsVersion!: string;
}

export class GetMetadataResponse {
  @IsSemVer()
  version!: string;

  @IsNotEmpty()
  @ValidateNested()
  schemas!: GetMetadataResponseSchemas;
}

export class PutMetadataParams extends ResourceParams {}

export class PostMetadataParams extends ResourceParams {}

export enum ValidationStrategy {
  none = "none",
  validate = "validate",
}

export class PostMetadataQuery {
  @IsOptional()
  @IsEnum(ValidationStrategy)
  validation?: ValidationStrategy;
}

class PostMetadataBodyGroup {
  @IsUUID()
  formVersion!: string;

  @IsUUID()
  authorizationVersion!: string;

  @IsUUID()
  relationshipsVersion!: string;
}

export class PostMetadataBody {
  @IsSemVer()
  version!: string;

  @IsNotEmpty()
  @Type(() => PostMetadataBodyGroup)
  @ValidateNested()
  schemas!: PostMetadataBodyGroup;
}

export class PutMetadataResponse {
  @IsBoolean()
  created!: boolean;
}

export class GetFormParams {
  @IsUUID()
  formId!: string;
}

export class GetFormResponse {
  @IsObject()
  form: any;

  @IsObject()
  schema: any;
}

export class PutFormBody {
  @IsJsonSchema(FormSchema, {
    allowUnionTypes: true,
  })
  definition!: Form;
}

export class GetAuthorizationParams {
  @IsUUID()
  authorizationId!: string;
}

export class GetAuthorizationResponse {
  @IsString()
  policy!: string;
}

export class PutAuthorizationBody {
  @IsString()
  policy!: string;
}

export class GetRelationshipsParams {
  @IsUUID()
  relationshipsId!: string;
}

class Relationship {
  @IsString()
  resource!: string;

  @IsString()
  key!: string;

  @IsEnum(RELATIONSHIP_TYPES)
  type!: RELATIONSHIP_TYPES;
}

export class IndexRelationship extends Relationship {
  @IsPositive()
  index!: number;

  @Equals(RELATIONSHIP_TYPES.INDEX)
  type!: RELATIONSHIP_TYPES.INDEX;
}

export class CompositeRelationship extends Relationship {
  @Equals(RELATIONSHIP_TYPES.COMPOSITE)
  type!: RELATIONSHIP_TYPES.COMPOSITE;

  @IsString()
  dataKey!: string;
}

export type ConcreteRelationships = IndexRelationship | CompositeRelationship;

export class GetRelationshipsResponse {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Relationship)
  relationships!: Map<string, ConcreteRelationships>;
}

export class PutRelationshipsBody {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Relationship, {
    discriminator: {
      property: "type",
      subTypes: [
        { value: IndexRelationship, name: RELATIONSHIP_TYPES.INDEX },
        { value: CompositeRelationship, name: RELATIONSHIP_TYPES.COMPOSITE }, // TODO: Fix not validating concrete keys
      ],
    },
  })
  relationships!: Map<string, ConcreteRelationships>;
}
