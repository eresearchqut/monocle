import { IsNotEmpty, IsString, IsUUID, ValidateNested } from "class-validator";
import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class GetConstraintsParams {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  constraintsId!: string;
}

class Constraint {
  @IsString()
  name!: string;

  @IsString({ each: true })
  keys!: string[];
}

@ApiExtraModels(Constraint)
export class GetConstraintsResponse {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Constraint)
  constraints!: Constraint[];
}

@ApiExtraModels(Constraint)
export class PostConstraintsBody {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Constraint)
  constraints!: Constraint[];
}
