import { PatientEntity, PatientFormEntity } from "src/module/patient/patient.entity";

interface AuditFields {
  Action: "CREATED" | "UPDATED" | "DELETED";
}

export type PatientAuditEntity = PatientEntity & AuditFields;

export type PatientFormAuditEntity = PatientFormEntity & AuditFields;
