import { InputCompiler } from '../interfaces';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { CurrencyInput, Form, Input, InputType, Section } from '@eresearchqut/form-definition';
import { AbstractInputCompiler } from './abstractInputCompiler';

export class CurrencyInputCompiler extends AbstractInputCompiler implements InputCompiler {
  supports(form: Form, section: Section, input: Input): boolean {
    return input.type === InputType.CURRENCY;
  }

  schema(form: Form, section: Section, input: Input): JsonSchema {
    const { maximum, minimum, description } = input as CurrencyInput;
    return { type: 'number', maximum, minimum, description } as JsonSchema;
  }

  ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
    return this.uiControl(form, section, input);
  }
}
