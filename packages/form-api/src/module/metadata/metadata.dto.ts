import {
  IsAlphanumeric,
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

class GetMetadataResponseGroup {
  @IsUUID()
  formVersion: string;

  @IsUUID()
  authorizationVersion: string;
}

export class GetMetadataResponse {
  @IsSemVer()
  version: string;

  @ValidateNested({ each: true })
  groups: { [groupName: string]: GetMetadataResponseGroup };
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

export class PostMetadataBody {
  @IsSemVer()
  version: string;

  @ValidateNested({ each: true })
  groups: { [groupName: string]: PostMetadataBodyGroup };
}

class PostMetadataBodyGroup {
  @IsUUID()
  formVersion: string;

  @IsUUID()
  authorizationVersion: string;
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
  @IsString()
  definition: string;
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
