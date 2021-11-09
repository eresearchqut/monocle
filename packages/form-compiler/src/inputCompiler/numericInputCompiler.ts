import { InputCompiler } from '../interfaces';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Form, Input, InputType, NumericInput, Section } from '@eresearchqut/form-definition';
import { AbstractInputCompiler } from './abstractInputCompiler';

export class NumericInputCompiler extends AbstractInputCompiler implements InputCompiler {
  supports(form: Form, section: Section, input: Input): boolean {
    return input.type === InputType.NUMERIC;
  }

  schema(form: Form, section: Section, input: Input): JsonSchema {
    const { decimalPlaces, maximum, minimum, increment, description } = input as NumericInput;
    const type = decimalPlaces && decimalPlaces > 0 ? 'number' : 'integer';
    return { type, maximum, minimum, multipleOf: increment, description } as JsonSchema;
  }

  ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
    const { decimalPlaces, increment } = input as NumericInput;
    const fractional = decimalPlaces && decimalPlaces > 0;
    if (fractional) {
      return this.uiControl(form, section, input, {
        decimalPlaces,
        increment,
      });
    }
    return this.uiControl(form, section, input);
  }
}
