import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsSemVer, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { OptionalSemverQuery, ResourceParams } from "src/dto/resource.dto";

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
