import { Equals, IsEnum, IsNotEmpty, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { RELATIONSHIP_TYPES } from "./relationships.constants";

export class GetRelationshipsParams {
  @IsUUID()
  relationshipsId!: string;
}

class Relationship {
  @IsString()
  resource!: string;

  @IsString()
  key!: string;

  @IsEnum(RELATIONSHIP_TYPES)
  type!: RELATIONSHIP_TYPES;
}

export class IndexRelationship extends Relationship {
  @IsPositive()
  index!: number;

  @Equals(RELATIONSHIP_TYPES.INDEX)
  type!: RELATIONSHIP_TYPES.INDEX;
}

export class CompositeRelationship extends Relationship {
  @Equals(RELATIONSHIP_TYPES.COMPOSITE)
  type!: RELATIONSHIP_TYPES.COMPOSITE;

  @IsString()
  dataKey!: string;
}

export type ConcreteRelationships = IndexRelationship | CompositeRelationship;

export class GetRelationshipsResponse {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Relationship)
  relationships!: Map<string, ConcreteRelationships>;
}

export class PostRelationshipsBody {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Relationship, {
    discriminator: {
      property: "type",
      subTypes: [
        { value: IndexRelationship, name: RELATIONSHIP_TYPES.INDEX },
        { value: CompositeRelationship, name: RELATIONSHIP_TYPES.COMPOSITE }, // TODO: Fix not validating concrete keys
      ],
    },
  })
  relationships!: Map<string, ConcreteRelationships>;
}
