import { IsAlphanumeric, IsUUID } from "class-validator";

export abstract class Registry {
  @IsAlphanumeric()
  registry: string;
}

export abstract class RegistryPatient extends Registry {
  @IsUUID(4)
  patient: string;
}

export abstract class RegistryPatientForm extends RegistryPatient {
  @IsUUID(4)
  form: string;
}
