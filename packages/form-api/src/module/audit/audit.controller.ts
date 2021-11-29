import { Controller, Get, Query } from "@nestjs/common";
import { GetPatientFormDto, GetPatientDto, GetPatientsDto } from "./audit.dto";
import { AuditService } from "./audit.service";

@Controller("/audit")
export class AuditController {
  public constructor(private auditService: AuditService) {}

  @Get("/patient")
  async getPatient(@Query() params: GetPatientDto) {
    return this.auditService.getPatient(params);
  }

  @Get("/patients")
  async getPatients(@Query() params: GetPatientsDto) {
    return this.auditService.getPatients(params);
  }

  @Get("/form")
  async getForm(@Query() params: GetPatientFormDto) {
    return this.auditService.getPatientForm(params);
  }
}
