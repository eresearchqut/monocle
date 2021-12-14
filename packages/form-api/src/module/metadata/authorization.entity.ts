import { Equals, IsISO8601, IsString, ValidateNested } from "class-validator";
import { ItemEntity } from "../dynamodb/dynamodb.entity";

export type MetadataAuthorizationType = ItemEntity<
  {
    Policy: string;
  },
  "Authorization"
>;

class MetadataAuthorizationData {
  @IsString()
  Policy: string;
}

export class MetadataAuthorization implements MetadataAuthorizationType {
  @IsString()
  Id: string;

  @IsString()
  PK: string;

  @IsString()
  SK: string;

  @Equals("Authorization")
  ItemType: "Authorization" = "Authorization";

  @IsISO8601()
  CreatedAt: string;

  @IsString()
  CreatedBy: string;

  @ValidateNested()
  Data: MetadataAuthorizationData;
}
