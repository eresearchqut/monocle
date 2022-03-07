import { Equals, IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { PARTITION_TYPES, PROJECTION_TYPES } from "./projections.constants";

export class GetProjectionsParams {
  @IsUUID()
  projectionsId!: string;
}

class Projection {
  @IsString()
  @IsOptional()
  resource?: string;

  @IsEnum(PARTITION_TYPES)
  partitionType!: PARTITION_TYPES;

  @IsString()
  key!: string;

  @IsEnum(PROJECTION_TYPES)
  projectionType!: PROJECTION_TYPES;
}

export class IndexProjection extends Projection {
  @IsPositive()
  index!: number;

  @Equals(PROJECTION_TYPES.INDEX)
  projectionType!: PROJECTION_TYPES.INDEX;
}

export class CompositeProjection extends Projection {
  @Equals(PROJECTION_TYPES.COMPOSITE_TRANSACTION)
  @Equals(PROJECTION_TYPES.COMPOSITE_LOCK)
  @Equals(PROJECTION_TYPES.COMPOSITE_STREAM)
  projectionType!:
    | PROJECTION_TYPES.COMPOSITE_TRANSACTION
    | PROJECTION_TYPES.COMPOSITE_LOCK
    | PROJECTION_TYPES.COMPOSITE_STREAM;

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
      property: "projectionType",
      subTypes: [
        { value: IndexProjection, name: PROJECTION_TYPES.INDEX },
        // TODO: Fix not validating concrete keys
        { value: CompositeProjection, name: PROJECTION_TYPES.COMPOSITE_TRANSACTION },
        { value: CompositeProjection, name: PROJECTION_TYPES.COMPOSITE_LOCK },
        { value: CompositeProjection, name: PROJECTION_TYPES.COMPOSITE_STREAM },
      ],
    },
  })
  projections!: Map<string, ConcreteProjections>;
}
