import { VersionErrorInterceptor } from "src/interceptor/dynamodb.interceptor";

export class FormTransactionInterceptor extends VersionErrorInterceptor {
  conditionFailureMessage = "Form data is possibly out of date";
}
