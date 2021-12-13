import {
  IsAlphanumeric,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsSemVer,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

abstract class ResourceParams {
  @IsAlphanumeric()
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
  @IsObject()
  form: any;

  @IsObject()
  authorization: any;
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
  validation: ValidationStrategy;
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

export class PutFormBody {
  @IsString()
  schema: string;
}

export class PutAuthorizationBody {
  @IsString()
  policy: string;
}
