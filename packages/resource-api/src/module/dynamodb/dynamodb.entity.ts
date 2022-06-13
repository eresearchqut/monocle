import { IsISO8601, IsNumber, IsOptional, IsSemVer, IsString, Matches, ValidateNested } from "class-validator";

export abstract class ItemEntity<T = any, U = string> {
  @IsString()
  Id!: string;

  @IsString()
  ItemType!: U;

  @IsISO8601()
  CreatedAt!: string;

  @IsString()
  CreatedBy!: string;

  @ValidateNested()
  Data!: T;

  @IsString()
  PK!: string;

  @IsString()
  SK!: string;

  @IsNumber()
  @IsOptional()
  TTL?: number;
}

export abstract class VersionedItemEntity<T = any, U = string> extends ItemEntity<T, U> {
  @IsNumber()
  Version!: number;
}
