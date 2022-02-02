import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsSemVer,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from "class-validator";
import { form as FormSchema, Form } from "@eresearchqut/form-definition";
import { IsJsonSchema } from "src/decorator/validate.decorator";
import { Type } from "class-transformer";
import { RELATIONSHIP_TYPES } from "./metadata.entity";

abstract class ResourceParams {
  @Matches(/[a-zA-Z0-9_]+/)
  resource: string;
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
  formVersion: string;

  @IsUUID()
  authorizationVersion: string;

  @IsUUID()
  relationshipsVersion: string;
}

class GetMetadataResponseRelationship {
  @IsEnum(RELATIONSHIP_TYPES)
  type: RELATIONSHIP_TYPES;

  @IsString()
  @ValidateNested({ each: true })
  key: string[];
}

export class GetMetadataResponse {
  @IsSemVer()
  version: string;

  @ValidateNested()
  schemas: GetMetadataResponseSchemas;
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
  formVersion: string;

  @IsUUID()
  authorizationVersion: string;

  @IsUUID()
  relationshipsVersion: string;
}

export class PostMetadataBody {
  @IsSemVer()
  version: string;

  @Type(() => PostMetadataBodyGroup)
  @ValidateNested()
  schemas: PostMetadataBodyGroup;
}

class PostMetadataBodyRelationship {
  @IsEnum(RELATIONSHIP_TYPES)
  type: RELATIONSHIP_TYPES;

  @IsString()
  @ValidateNested({ each: true })
  key: string[];
}

export class PutMetadataResponse {
  @IsBoolean()
  created: boolean;
}

export class GetFormParams {
  @IsUUID()
  formId: string;
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
  definition: Form;
}

export class GetAuthorizationParams {
  @IsUUID()
  authorizationId: string;
}

export class GetAuthorizationResponse {
  @IsString()
  policy: string;
}

export class PutAuthorizationBody {
  @IsString()
  policy: string;
}
