import { IsNumber, IsObject, IsOptional, IsSemVer, IsString, Matches, Min } from "class-validator";
import { ResourceParams } from "../../dto/resource.dto";

abstract class DataResourceParams {
  @IsObject()
  data: any;
}

abstract class OptionallyVersionedResourceQuery {
  @IsSemVer()
  @IsOptional()
  version?: string;
}

export class PostResourceParams extends ResourceParams {}

export class PostResourceQuery extends OptionallyVersionedResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
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

export class PutResourceParams extends ResourceParams {
  @IsString()
  id!: string;
}

export class PutResourceQuery extends OptionallyVersionedResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
}

export class PutResourceBody extends DataResourceParams {
  @IsNumber()
  @Min(1)
  version!: number;
}

export class DeleteResourceParams extends ResourceParams {
  @IsString()
  id!: string;
}

export class DeleteResourceQuery {
  @IsObject()
  @IsOptional()
  options: any;
}

export class QueryResourceParams extends ResourceParams {}

export class QueryRelatedResourceParams extends ResourceParams {
  @IsString()
  id!: string;

  @IsString()
  @IsOptional()
  targetResource?: string;

  @IsString()
  relationship!: string;
}
