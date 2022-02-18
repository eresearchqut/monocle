import { IsString, IsUUID } from "class-validator";

export class GetAuthorizationParams {
  @IsUUID()
  authorizationId!: string;
}

export class GetAuthorizationResponse {
  @IsString()
  policy!: string;
}

export class PutAuthorizationBody {
  @IsString()
  policy!: string;
}
