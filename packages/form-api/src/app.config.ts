import { plainToClass, Transform } from "class-transformer";
import { IsAscii, IsBoolean, IsInt, IsString, validateSync } from "class-validator";
import { ConfigService } from "@nestjs/config";

function strToBool(params: { value: any }) {
  const value = params.value;
  return value.toLowerCase() === "true" || value === "1";
}

function strToInt(params: { value: any }) {
  return parseInt(params.value, 10);
}

/* eslint-disable @typescript-eslint/no-inferrable-types */
export class AppConfig {
  /**
   * The port to listen bind on local dev sever
   */
  @Transform(strToInt)
  @IsInt()
  PORT: number = 3003;

  /**
   * The table name to use for the database.
   */
  @IsAscii()
  RESOURCE_TABLE: string = "default_resources";

  /**
   * Use a local database for development.
   */
  @Transform(strToBool)
  @IsBoolean()
  LOCAL_DATABASE: boolean = false;

  /**
   * AWS Region
   */
  @IsString()
  AWS_REGION: string = "ap-southeast-2";

  /**
   * Local database endpoint.
   */
  @IsString()
  LOCAL_DATABASE_ENDPOINT: string = "http://localhost:8000";

  /**
   * Validate the metadata items read from the database
   */
  @Transform(strToBool)
  @IsBoolean()
  VALIDATE_METADATA_ON_READ: boolean = false;

  /**
   * Validate the resource data read from the database
   */
  @Transform(strToBool)
  @IsBoolean()
  VALIDATE_RESOURCE_ON_READ: boolean = false;

  /**
   * Validate the metadata items written to the database
   */
  @Transform(strToBool)
  @IsBoolean()
  VALIDATE_METADATA_ON_WRITE = true;

  /**
   * Validate the resource items written to the database
   */
  @Transform(strToBool)
  VALIDATE_RESOURCE_ON_WRITE = true;
}

/* eslint-enable @typescript-eslint/no-inferrable-types */

export type AppConfigService = ConfigService<AppConfig, true>;

export function validateConfig(config: Record<string, unknown>): AppConfig {
  const validated = plainToClass(AppConfig, config, {
    // Can't enable because this breaks boolean values
    enableImplicitConversion: false,
    // Can't enable because this breaks boolean values
    excludeExtraneousValues: false,
  });
  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validated;
}
