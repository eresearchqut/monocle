import { PatientController } from "../src/module/patient/patient.controller";
import { PatientService } from "../src/module/patient/patient.service";
import { Test } from "@nestjs/testing";

describe("Patient Controller", () => {
  let patientController: PatientController;
  let patientService: PatientService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PatientController],
      providers: [PatientService],
    }).compile();

    // patientService = moduleRef.get<PatientService>(PatientService);
    patientController = moduleRef.get<PatientController>(PatientController);
  });

  describe("Patient", () => {
    it("should add patients", async () => {
      expect(
        await patientController.addPatient({
          registry: "test",
        })
      ).toHaveProperty(["id", "CreatedAt", "CreatedBy"]);
    });
  });
});
