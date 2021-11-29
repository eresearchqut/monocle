import { Registry, RegistryPatient, RegistryPatientForm } from "src/dto/common.dto";
import { IsBoolean, IsInt, IsObject, IsOptional, IsString } from "class-validator";

export class GetPatientDto extends RegistryPatient {
  @IsOptional()
  @IsBoolean()
  consistent: boolean;
}

export class AddPatientDto extends Registry {}

export class GetPatientsDto extends Registry {
  @IsOptional()
  @IsInt()
  limit: number;
}

export class GetPatientFormDto extends RegistryPatientForm {
  @IsOptional()
  @IsBoolean()
  consistent: boolean;
}

export class GetPatientFormLongitudinalHistory extends RegistryPatientForm {
  @IsOptional()
  @IsInt()
  limit: number;
}

export class SavePatientFormDto extends RegistryPatientForm {
  @IsString()
  lastVersion: string;

  @IsOptional()
  @IsBoolean()
  writeWeak: boolean;

  @IsObject()
  formData: Record<string, unknown>;
}
