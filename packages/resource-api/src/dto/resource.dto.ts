import { IsOptional, IsSemVer, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export abstract class ResourceParams {
  @ApiProperty({ pattern: "/[a-zA-Z0-9_]+/" })
  @Matches(/[a-zA-Z0-9_]+/)
  resource!: string;
}

export abstract class OptionalSemverQuery {
  @IsOptional()
  @IsSemVer()
  version?: string;
}
