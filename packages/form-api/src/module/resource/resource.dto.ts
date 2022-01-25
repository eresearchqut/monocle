import { IsObject, IsOptional, IsSemVer, IsString, Matches } from "class-validator";

abstract class ResourceParams {
  @Matches(/[a-zA-Z0-9_]+/)
  resource: string;
}

abstract class DataResourceParams {
  @IsObject()
  data: any;
}

abstract class OptionallyVersionedResourceParams extends ResourceParams {
  @IsSemVer()
  @IsOptional()
  version: string;
}

export class PutResourceParams extends OptionallyVersionedResourceParams {}

export class PutResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
}

export class PutResourceBody extends DataResourceParams {}

export class GetResourceParams extends ResourceParams {
  @IsString()
  id: string;
}

export class GetResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
}

export class PostResourceParams extends OptionallyVersionedResourceParams {
  @IsString()
  id: string;
}

export class PostResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
}

export class PostResourceBody extends DataResourceParams {}

export class DeleteResourceParams extends ResourceParams {
  @IsString()
  id: string;
}

export class DeleteResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
}