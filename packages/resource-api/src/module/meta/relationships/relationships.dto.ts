import { IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";

export class GetRelationshipsParams {
  @ApiProperty({ format: "uuid" })
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

@ApiExtraModels(Relationship)
export class GetRelationshipsResponse {
  @ApiProperty({
    type: "object",
    additionalProperties: { $ref: getSchemaPath(Relationship) },
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Relationship)
  relationships!: Map<string, Relationship>;
}

@ApiExtraModels(Relationship)
export class PostRelationshipsBody {
  @ApiProperty({
    type: "object",
    additionalProperties: { $ref: getSchemaPath(Relationship) },
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Relationship, {})
  relationships!: Map<string, Relationship>;
}
