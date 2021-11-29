import { Injectable } from "@nestjs/common";
import { GetPatientFormDto, GetPatientDto, GetPatientsDto, GetPatientFormsDto } from "./audit.dto";
import { arrayFromAsync, asyncSlice, execPipe } from "iter-tools-es";
import { GSI, historyTable, ItemEntity, queryItems } from "src/repository/dynamodb.repository";
import { PatientAuditEntity, PatientFormAuditEntity } from "./audit.entity";
import { PatientEntity } from "../patient/patient.entity";

@Injectable()
export class AuditService {
  async getPatient(params: GetPatientDto): Promise<PatientAuditEntity[]> {
    return execPipe(
      queryItems<PatientAuditEntity>({
        table: historyTable(params.registry),
        keyCondition: "#PK = :Patient and #SK BETWEEN :Start and :End",
        expressionNames: {
          "#PK": "PK",
          "#SK": "SK",
        },
        expressionValues: {
          ":Patient": `p#${params.patient}_p#${params.patient}`,
          ":Start": Date.parse(params.start),
          ":End": Date.parse(params.end),
        },
      }),
      asyncSlice(0, params.limit || Infinity),
      arrayFromAsync
    );
  }

  async getPatients(params: GetPatientsDto): Promise<PatientAuditEntity[]> {
    return getAllEntities(params.registry, "Patient", params.start, params.end, params.limit);
  }

  async getPatientForm(params: GetPatientFormDto): Promise<PatientFormAuditEntity[]> {
    return execPipe(
      queryItems<PatientFormAuditEntity>({
        table: historyTable(params.registry),
        keyCondition: "#PK = :PatientForm and #SK BETWEEN :Start and :End",
        expressionNames: {
          "#PK": "PK",
          "#SK": "SK",
        },
        expressionValues: {
          ":PatientForm": `p#${params.patient}_pf#${params.form}:latest`,
          ":Start": Date.parse(params.start),
          ":End": Date.parse(params.end),
        },
      }),
      asyncSlice(0, params.limit || Infinity),
      arrayFromAsync
    );
  }

  async getPatientForms(params: GetPatientFormsDto): Promise<PatientFormAuditEntity[]> {
    return getAllEntities(params.registry, "PatientForm", params.start, params.end, params.limit)
  }
}

async function getAllEntities<T extends ItemEntity>(
  registry: string,
  entity: string,
  start: string,
  end: string,
  limit: number
): Promise<any> {
  return execPipe(
    queryItems<T>({
      table: historyTable(registry),
      index: GSI.GSI1,
      keyCondition: "#PK = :Patient and #SK BETWEEN :Start and :End",
      expressionNames: {
        "#PK": "PK",
        "#SK": "SK",
      },
      expressionValues: {
        ":Entity": entity,
        ":Start": Date.parse(start),
        ":End": Date.parse(end),
      },
    }),
    asyncSlice(0, limit || Infinity),
    arrayFromAsync
  );
}
