import { Equals, IsBoolean, IsIBAN, IsObject, IsOptional, IsSemVer, IsString, Matches } from "class-validator";

abstract class ResourceParams {
  @Matches(/[a-zA-Z0-9_]+/)
  resource!: string;
}

abstract class DataResourceParams {
  @IsObject()
  data: any;
}

abstract class OptionallyVersionedResourceParams extends ResourceParams {
  @IsSemVer()
  @IsOptional()
  version!: string;
}

export class PostResourceParams extends OptionallyVersionedResourceParams {}

export class PostResourceQuery {
  @IsObject()
  @IsOptional()
  options!: any;
}

export class PostResourceBody extends DataResourceParams {}

export class GetResourceParams extends ResourceParams {
  @IsString()
  id!: string;
}

export class GetResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
}

export class PutResourceParams extends OptionallyVersionedResourceParams {
  @IsString()
  id!: string;
}

export class PutResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
}

export class PutResourceBody extends DataResourceParams {}

export class DeleteResourceParams extends ResourceParams {
  @IsString()
  id!: string;
}

export class DeleteResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
}

export class QueryResourceParams extends OptionallyVersionedResourceParams {}

export class QueryResourceProjectionParams extends ResourceParams {
  @IsString()
  projection!: string;
}

export class QueryResourceProjectionQuery {
  @Equals("reverse")
  @IsOptional()
  order?: "reverse";

  @IsString()
  @IsOptional()
  query?: string;
}

export class QueryRelatedResourceParams extends ResourceParams {
  @IsString()
  id!: string;

  @IsString()
  targetResource!: string;

  @IsString()
  projection!: string;
}
