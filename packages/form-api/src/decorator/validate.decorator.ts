import { AppConfig, AppConfigService } from "../app.config";
import { registerDecorator, validateOrReject, ValidationOptions } from "class-validator";
import Ajv, { JSONSchemaType, Options as AjvOptions } from "ajv";
import addFormats from "ajv-formats";

// https://stackoverflow.com/a/50851710
type BooleanKeys<T> = { [k in keyof T]: T[k] extends boolean ? k : never }[keyof T];

// https://blog.logrocket.com/a-practical-guide-to-typescript-decorators/
// Generic method decorators aren't powerful yet: https://github.com/microsoft/TypeScript/issues/17936

/**
 * Validate the returned class instance when configured to according to AppConfig setting
 */
export const ConditionallyValidateClassAsync = (setting: BooleanKeys<AppConfig>): MethodDecorator => {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value as unknown as (...args: any[]) => Promise<any>;
    descriptor.value = async function (...args: any[]) {
      if ((this as { configService: AppConfigService }).configService.get(setting)) {
        return originalMethod.apply(this, args).then(async (result) => {
          await validateOrReject(result);
          return result;
        });
      } else {
        return originalMethod.apply(this, args);
      }
    };
  };
};

/**
 * Validate the returned class instances when configured to according to AppConfig setting
 */
export const ConditionallyValidateClassAsyncGenerator = (setting: BooleanKeys<AppConfig>): MethodDecorator => {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value as unknown as (...args: any[]) => AsyncGenerator<any>;
    descriptor.value = async function* (...args: any[]) {
      if ((this as { configService: AppConfigService }).configService.get(setting)) {
        for await (const result of originalMethod.apply(this, args)) {
          await validateOrReject(result);
          yield result;
        }
      } else {
        for await (const result of originalMethod.apply(this, args)) {
          yield result;
        }
      }
    };
  };
};

/**
 * class-validator decorator that validates according to JSON schema
 */
export function IsJsonSchema(
  schema: JSONSchemaType<unknown>,
  ajvOptions?: AjvOptions,
  validationOptions?: ValidationOptions
) {
  // https://github.com/typestack/class-validator#custom-validation-decorators
  return function (object: any, propertyName: string) {
    const ajv = new Ajv(ajvOptions);
    addFormats(ajv);
    const validator = ajv.compile(schema);

    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: Record<string, any>) {
          return validator(value);
        },
      },
    });
  };
}
