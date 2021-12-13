import { IsString, ValidateNested } from "class-validator";

export class ItemEntity<T = any, U = string> {
  @IsString()
  Id: string;

  @IsString()
  ItemType: U;

  @IsString()
  CreatedAt: string;

  @IsString()
  CreatedBy: string;

  @ValidateNested()
  Data: T;

  @IsString()
  PK: string;

  @IsString()
  SK?: string;
}
