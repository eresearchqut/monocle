import { Equals, IsString, ValidateNested } from "class-validator";
import { ItemEntity } from "../../dynamodb/dynamodb.entity";

interface DataType {
  Policy: string;
}

export type MetadataAuthorizationType = ItemEntity<DataType, "Authorization">;

class MetadataAuthorizationData {
  @IsString()
  Policy!: string;
}

export class MetadataAuthorization extends ItemEntity<DataType, "Authorization"> implements MetadataAuthorizationType {
  @Equals("Authorization")
  ItemType: "Authorization" = "Authorization";

  @ValidateNested()
  Data!: MetadataAuthorizationData;
}
