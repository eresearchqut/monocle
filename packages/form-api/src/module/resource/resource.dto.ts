import { IsAlphanumeric, IsObject, IsOptional, IsSemVer, IsString, IsUUID } from "class-validator";

abstract class ResourceParams {
  @IsAlphanumeric()
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

export class PutResourceData extends DataResourceParams {
  @IsObject()
  @IsOptional()
  options: any;
}

export class GetResourceParams extends ResourceParams {
  @IsString()
  id: string;
}

export class GetResourceData {
  @IsObject()
  @IsOptional()
  options: any;
}

export class PostResourceParams extends OptionallyVersionedResourceParams {
  @IsString()
  id: string;
}

export class PostResourceData extends DataResourceParams {
  @IsObject()
  @IsOptional()
  options: any;
}

export class DeleteResourceParams extends ResourceParams {
  @IsString()
  id: string;
}

export class DeleteResourceData {
  @IsObject()
  @IsOptional()
  options: any;
}
