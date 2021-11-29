import { AppConfig, AppConfigService } from "../app.config";
import { validateOrReject } from "class-validator";

// https://stackoverflow.com/a/50851710
type BooleanKeys<T> = { [k in keyof T]: T[k] extends boolean ? k : never }[keyof T];

/**
 * Validate the returned class instance when configured to according to AppConfig setting
 */
export function ConditionallyValidateClass(setting: BooleanKeys<AppConfig>): MethodDecorator {
  return (target: { configService?: AppConfigService }, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (target.configService?.get(setting)) {
      // https://blog.logrocket.com/a-practical-guide-to-typescript-decorators/
      const originalMethod = descriptor.value;
      descriptor.value = async (...args: any[]) => {
        const result = await originalMethod.apply(this, args);
        return await validateOrReject(result);
      };
    }
  };
}
