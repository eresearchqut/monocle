import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {Form, Input, NumericInput, Section} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';

export class NumericInputCompiler extends AbstractInputCompiler implements InputCompiler {
  supports(form: Form, section: Section, input: Input): boolean {
    return input.type === 'numeric';
  }

  schema(form: Form, section: Section, input: Input): JsonSchema {
    const {decimalPlaces, maximum, minimum, increment} = input as NumericInput;
    const type = decimalPlaces && decimalPlaces > 0 ? 'number' : 'integer';
    return {type, maximum, minimum, multipleOf: increment} as JsonSchema;
  }

  ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
    const {decimalPlaces, increment} = input as NumericInput;
    const fractional = decimalPlaces && decimalPlaces > 0;
    if (fractional) {
      return this.uiControl(form, section, input, {
        decimalPlaces, increment,
      });
    }
    return this.uiControl(form, section, input);
  }
}

