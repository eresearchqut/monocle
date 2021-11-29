import { Injectable } from "@nestjs/common";
import { getItem, rootTable } from "src/repository/dynamodb.repository";
import { PatientResource, ResourceTypeCondition, ResourceTypeNames, UserResource } from "./oldResource.resource";
import { plainToClass } from "class-transformer";

interface getResourceParams {
  validate?: boolean;
}

@Injectable()
export class OldResourceService {
  public async getResource<T extends ResourceTypeNames>(
    resource: T,
    params: getResourceParams
  ): Promise<ResourceTypeCondition<T>> {
    const key = this.getResourceClass(resource, params).getKey();
    const item = await getItem(key);
    return this.getResourceClass(resource, item);
  }

  private getResourceClass<T extends ResourceTypeNames>(resourceType: T, data: any): ResourceTypeCondition<T> {
    switch (resourceType) {
      case "Patient":
        return plainToClass(PatientResource, data) as ResourceTypeCondition<T>;
      case "User":
        return plainToClass(UserResource, data) as ResourceTypeCondition<T>;
      default:
        // eslint-disable-next-line
        // noinspection UnnecessaryLocalVariableJS
        const _exhaustiveCheck: never = resourceType; // Must add a case for new oldResource type when this doesn't compile
        return _exhaustiveCheck;
    }
  }
}
