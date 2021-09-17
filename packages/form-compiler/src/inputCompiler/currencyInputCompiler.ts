import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {CurrencyInput, Form, Input, Section} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';


export class CurrencyInputCompiler extends AbstractInputCompiler implements InputCompiler {
  supports(form: Form, section: Section, input: Input): boolean {
    return input.type === 'currency';
  }

  schema(form: Form, section: Section, input: Input): JsonSchema {
    const {maximum, minimum} = input as CurrencyInput;
    return {type: 'number', maximum, minimum} as JsonSchema;
  }

  ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
    return this.uiControl(form, section, input);
  }
}

