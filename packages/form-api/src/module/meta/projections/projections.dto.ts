import { Equals, IsEnum, IsNotEmpty, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { PROJECTION_TYPES } from "./projections.constants";

export class GetProjectionsParams {
  @IsUUID()
  projectionsId!: string;
}

class Projection {
  @IsString()
  resource?: string;

  @IsString()
  key!: string;

  @IsEnum(PROJECTION_TYPES)
  type!: PROJECTION_TYPES;
}

export class IndexProjection extends Projection {
  @IsPositive()
  index!: number;

  @Equals(PROJECTION_TYPES.INDEX)
  type!: PROJECTION_TYPES.INDEX;
}

export class CompositeProjection extends Projection {
  @Equals(PROJECTION_TYPES.COMPOSITE)
  type!: PROJECTION_TYPES.COMPOSITE;

  @IsString()
  dataKey!: string;
}

export type ConcreteProjections = IndexProjection | CompositeProjection;

export class GetProjectionsResponse {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Projection)
  projections!: Map<string, ConcreteProjections>;
}

export class PostProjectionsBody {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => Projection, {
    discriminator: {
      property: "type",
      subTypes: [
        { value: IndexProjection, name: PROJECTION_TYPES.INDEX },
        { value: CompositeProjection, name: PROJECTION_TYPES.COMPOSITE }, // TODO: Fix not validating concrete keys
      ],
    },
  })
  projections!: Map<string, ConcreteProjections>;
}
