import { IsAlphanumeric, IsEmail, IsISO8601, IsLowercase, IsString, IsUUID } from "class-validator";
import { plainToClass } from "class-transformer";
import { rootTable } from "../../repository/dynamodb.repository";

abstract class AbstractResource {
  @IsString()
  PK: string;

  @IsString()
  SK: string;

  @IsAlphanumeric()
  @IsLowercase()
  Registry: string;

  @IsString()
  abstract ResourceType: string;

  @IsUUID()
  id: string;

  @IsISO8601()
  CreatedAt: string;

  @IsString()
  CreatedBy: string;

  public getKey(): { table: string; key: [string, string?] } {
    const key = `${this.ResourceType}#${this.id}:${this.id}`;
    return {
      table: rootTable(this.Registry),
      key: [key, key],
    };
  }

  public getCreatedAt(): { CreatedAt: string } {
    return { CreatedAt: new Date().toISOString() };
  }
}

export class PatientResource extends AbstractResource {
  ResourceType: "Patient";
}

const testPatient: PatientResource = plainToClass(PatientResource, {
  PK: "1",
  SK: "1",
  Registry: "abc",
  id: "1",
  CreatedAt: "1",
  CreatedBy: "1",
  ResourceType: "Patient",
});

export class UserResource extends AbstractResource {
  ResourceType: "User";

  @IsEmail()
  email: string;
}

const testUser: UserResource = plainToClass(UserResource, {
  PK: "1",
  SK: "1",
  Registry: "abc",
  id: "1",
  CreatedAt: "1",
  CreatedBy: "1",
  Email: "1",
  ResourceType: "User",
});

export class PatientFormResource extends AbstractResource {
  ResourceType: "PatientForm";

  // Latest version string
  Latest: string;

  // UUID of the patient
  Patient: string;

  // Form identifier
  Form: string;

  // Form data
  Data: Record<string, unknown>;
}

export type ResourceClasses = PatientResource | UserResource;

export type ResourceTypeNames = ResourceClasses["ResourceType"];

export type ResourceTypeMap = {
  [key in ResourceTypeNames]: new (...args: any[]) => ResourceClasses;
};

const concreteResourceTypeMap: ResourceTypeMap = {
  Patient: PatientResource,
  User: UserResource,
  // PatientForm: PatientFormResource,
};

export type ResourceTypeCondition<T extends ResourceTypeNames> = T extends "Patient"
  ? PatientResource
  : T extends "User"
  ? UserResource
  : never;
