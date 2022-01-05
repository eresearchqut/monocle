import { AppConfig, AppConfigService } from "../app.config";
import { registerDecorator, validateOrReject, ValidationOptions } from "class-validator";
import Ajv, { JSONSchemaType, Options as AjvOptions } from "ajv";
import addFormats from "ajv-formats";

// https://stackoverflow.com/a/50851710
type BooleanKeys<T> = { [k in keyof T]: T[k] extends boolean ? k : never }[keyof T];

// https://blog.logrocket.com/a-practical-guide-to-typescript-decorators/

/**
 * Validate the returned class instance when configured to according to AppConfig setting
 */
export const ConditionallyValidateClassAsync = (setting: BooleanKeys<AppConfig>): MethodDecorator => {
  return (target: { configService: AppConfigService }, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod: (...args) => Promise<any> = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      if (this.configService.get(setting)) {
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
  return (target: { configService: AppConfigService }, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod: (...args) => AsyncGenerator<any> = descriptor.value;
    descriptor.value = async function* (...args: any[]) {
      if (this.configService.get(setting)) {
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
