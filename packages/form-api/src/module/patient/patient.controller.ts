import { Controller, Get, Post, Query, UseInterceptors } from "@nestjs/common";
import { PatientService } from "./patient.service";
import {
  AddPatientDto,
  GetPatientDto,
  GetPatientFormDto,
  GetPatientFormLongitudinalHistory,
  GetPatientsDto,
  SavePatientFormDto,
} from "./patient.dto";
import { FormTransactionInterceptor } from "./patient.interceptor";

@Controller()
export class PatientController {
  public constructor(private patientService: PatientService) {}

  @Get("/patient")
  async getPatient(@Query() params: GetPatientDto) {
    return this.patientService.getPatient(params);
  }

  @Post("/patient")
  async addPatient(@Query() params: AddPatientDto) {
    return this.patientService.addPatient(params);
  }

  @Get("/patients")
  async getPatientList(@Query() params: GetPatientsDto) {
    return this.patientService.getPatients(params);
  }

  @Get("/form")
  async getPatientForm(@Query() params: GetPatientFormDto) {
    return this.patientService.getPatientForm(params);
  }

  @Post("/form")
  @UseInterceptors(FormTransactionInterceptor)
  async savePatientForm(@Query() params: SavePatientFormDto) {
    return this.patientService.savePatientForm(params);
  }

  @Get("/formLongitudinalHistory")
  async getPatientFormLongitudinalHistory(@Query() params: GetPatientFormLongitudinalHistory) {
    return this.patientService.getPatientFormLongitudinalHistory(params);
  }
}
