import { Injectable } from "@nestjs/common";
import {
  AddPatientDto,
  GetPatientDto,
  GetPatientFormDto,
  GetPatientFormLongitudinalHistory,
  GetPatientsDto,
  SavePatientFormDto,
} from "./patient.dto";
import { getItem, GSI, putItem, putVersioned, queryItems, rootTable } from "src/repository/dynamodb.repository";
import { arrayFromAsync, asyncSlice, execPipe } from "iter-tools-es";
import { PatientEntity, PatientFormEntity } from "./patient.entity";
import { v4 as uuid4 } from "uuid";

@Injectable()
export class PatientService {
  async getPatient(params: GetPatientDto): Promise<PatientEntity | null> {
    return await getItem<PatientEntity>({
      table: rootTable(params.registry),
      key: [`p#${params.patient}`, `p#${params.patient}`],
      consistent: params.consistent,
    });
  }

  async getPatients(params: GetPatientsDto): Promise<PatientEntity[]> {
    return execPipe(
      queryItems<PatientEntity>({
        table: rootTable(params.registry),
        index: GSI.GSI1,
        keyCondition: "#PK = :Patient",
        expressionNames: {
          "#PK": "PK",
        },
        expressionValues: {
          ":Patient": "Patient",
        },
      }),
      asyncSlice(0, params.limit || Infinity),
      arrayFromAsync
    );
  }

  async addPatient(params: AddPatientDto) {
    const newId = uuid4();
    const patient: PatientEntity = {
      PK: `p#${newId}`,
      SK: `p#${newId}`,
      ResourceType: "Patient",
      id: newId,
      CreatedBy: "null", // TODO: retrieve user from cognito headers
      CreatedAt: Date.now(),
    };

    await putItem<PatientEntity>({
      table: rootTable(params.registry),
      data: patient,
    });

    return patient;
  }

  async getPatientForm(params: GetPatientFormDto): Promise<PatientFormEntity | null> {
    return getItem<PatientFormEntity>({
      table: rootTable(params.registry),
      key: [`p#${params.patient}`, `pf#${params.form}:latest`],
      consistent: params.consistent,
    });
  }

  async savePatientForm(params: SavePatientFormDto) {
    // TODO: validate params.data according to registry definition

    // TODO: build longitudinal version string according to registry definition
    const latestVersion = Date.now().toString();

    // TODO: retrieve user from cognito headers
    const userId = "null";

    // TODO: retrieve from registry definition rather than request
    if (params.writeWeak) {
      return Promise.all([
        putItem<PatientFormEntity>({
          table: rootTable(params.registry),
          data: {
            PK: `p#${params.patient}`,
            SK: `pf#${params.form}:latest`,
            ResourceType: "PatientForm",
            Latest: latestVersion,
            CreatedAt: Date.now(),
            CreatedBy: userId,
            Patient: params.patient,
            Form: params.form,
            Data: params.formData,
          },
        }),
        putItem<PatientFormEntity>({
          table: rootTable(params.registry),
          data: {
            PK: `p#${params.patient}`,
            SK: `pf#${params.form}:${latestVersion}`,
            ResourceType: "PatientForm",
            Latest: latestVersion,
            CreatedAt: Date.now(),
            CreatedBy: userId,
            Patient: params.patient,
            Form: params.form,
            Data: params.formData,
          },
        }),
      ]);
    } else {
      return putVersioned<PatientFormEntity>({
        table: rootTable(params.registry),
        lastVersion: params.lastVersion,
        nextVersion: Date.now().toString(),
        item: {
          PK: `p#${params.patient}`,
          SK: `pf#${params.form}`, // prefix only
          ResourceType: "PatientForm",
          Latest: latestVersion,
          CreatedAt: Date.now(),
          CreatedBy: userId,
          Patient: params.patient,
          Form: params.form,
          Data: params.formData,
        },
      });
    }
  }

  async getPatientFormLongitudinalHistory(params: GetPatientFormLongitudinalHistory): Promise<PatientFormEntity[]> {
    return execPipe(
      queryItems<PatientFormEntity>({
        table: rootTable(params.registry),
        keyCondition: "#PK = :Patient and #SK begins_with(:Form)",
        expressionNames: {
          "#PK": "PK",
          "#SK": "SK",
        },
        expressionValues: {
          ":Patient": `p#${params.patient}`,
          ":Form": `pf#${params.form}`,
        },
      }),
      asyncSlice(0, params.limit || Infinity),
      arrayFromAsync
    );
  }
}
