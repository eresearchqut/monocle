import { IsString, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetAuthorizationParams {
  @ApiProperty({ format: "uuid" })
  @IsUUID()
  authorizationId!: string;
}

export class GetAuthorizationResponse {
  @IsString()
  policy!: string;
}

export class PostAuthorizationBody {
  @IsString()
  policy!: string;
}
