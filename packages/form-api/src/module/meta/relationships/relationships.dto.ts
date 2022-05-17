import { IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class GetRelationshipsParams {
  @IsUUID()
  relationshipsId!: string;
}

class Relationship {
  @IsString()
  resource!: string;

  @IsString()
  key!: string;

  @IsString()
  dataKey!: string;
}

export class GetRelationshipsResponse {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Relationship)
  relationships!: Map<string, Relationship>;
}

export class PostRelationshipsBody {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Relationship, {})
  relationships!: Map<string, Relationship>;
}
