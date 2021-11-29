interface CommonEntity {
  PK: string;
  SK: string;
  ResourceType: string;
}

export interface PatientEntity extends CommonEntity {
  ResourceType: "Patient";

  // UUID
  id: string;

  // Unix time when created
  CreatedAt: number;

  // UUID of the creating user
  CreatedBy: string;
}

export interface PatientFormEntity extends CommonEntity {
  ResourceType: "PatientForm";

  // Latest version string
  Latest: string;

  // Unix time when created
  CreatedAt: number;

  // UUID of the creating user
  CreatedBy: string;

  // UUID of the patient
  Patient: string;

  // Form identifier
  Form: string;

  // Form data
  Data: Record<string, unknown>;
}
