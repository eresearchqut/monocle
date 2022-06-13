import { IsOptional, IsString } from "class-validator";

export class HelloQuery {
  @IsString()
  @IsOptional()
  name?: string;
}
