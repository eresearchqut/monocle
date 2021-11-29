import { Registry, RegistryPatient, RegistryPatientForm } from "src/dto/common.dto";
import { IsInt, IsOptional, IsRFC3339 } from "class-validator";

export class GetPatientDto extends RegistryPatient {
  @IsRFC3339()
  start: string;

  @IsRFC3339()
  end: string;

  @IsOptional()
  @IsInt()
  limit: number;
}

export class GetPatientsDto extends Registry {
  @IsRFC3339()
  start: string;

  @IsRFC3339()
  end: string;

  @IsOptional()
  @IsInt()
  limit: number;
}

export class GetPatientFormDto extends RegistryPatientForm {
  @IsRFC3339()
  start: string;

  @IsRFC3339()
  end: string;

  @IsOptional()
  @IsInt()
  limit: number;
}

export class GetPatientFormsDto extends RegistryPatientForm {
  @IsRFC3339()
  start: string;

  @IsRFC3339()
  end: string;

  @IsOptional()
  @IsInt()
  limit: number;
}
