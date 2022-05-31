import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsSemVer, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { OptionalSemverQuery, ResourceParams } from "src/dto/resource.dto";
import { ApiProperty } from "@nestjs/swagger";

export class GetMetadataParams extends ResourceParams {}

export class GetMetadataQuery extends OptionalSemverQuery {}

class GetMetadataResponseSchemas {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  formVersion!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  authorizationVersion!: string;
  @ApiProperty({ format: "uuid" })
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

export class PostMetadataParams extends ResourceParams {}

export class PutMetadataParams extends ResourceParams {}

export enum ValidationStrategy {
  none = "none",
  validate = "validate",
}

export class PutMetadataQuery {
  @IsOptional()
  @IsEnum(ValidationStrategy)
  validation?: ValidationStrategy;
}

class PostMetadataBodyGroup {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  formVersion!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  authorizationVersion!: string;

  @ApiProperty({ format: "uuid" })
  @IsUUID()
  relationshipsVersion!: string;
}

export class PutMetadataBody {
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
