import { IsOptional, IsSemVer, Matches } from "class-validator";

export abstract class ResourceParams {
  @Matches(/[a-zA-Z0-9_]+/)
  resource!: string;
}

export abstract class OptionalSemverQuery {
  @IsOptional()
  @IsSemVer()
  version?: string;
}
