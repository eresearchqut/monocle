import { ClassConstructor, ClassTransformer, ClassTransformOptions } from "class-transformer";

/**
 * class-transformer plainToClass decorator for async generators
 */
export function TransformAsyncGeneratorPlainToClass(
  classType: ClassConstructor<any>,
  params?: ClassTransformOptions
): MethodDecorator {
  return function (target: Record<string, any>, propertyKey: string, descriptor: PropertyDescriptor): void {
    const classTransformer: ClassTransformer = new ClassTransformer();
    const originalMethod = descriptor.value;

    descriptor.value = async function* (...args: any[]): AsyncGenerator<Record<string, any>> {
      for await (const result of originalMethod.apply(this, args)) {
        yield classTransformer.plainToClass(classType, result, params);
      }
    };
  };
}
