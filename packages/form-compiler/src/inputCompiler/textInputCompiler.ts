import { InputCompiler } from '../interfaces';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Form, Input, InputType, Section } from '@eresearchqut/form-definition';
import { AbstractInputCompiler } from './abstractInputCompiler';
import { TextInput } from '@eresearchqut/form-definition/dist/interfaces';

export class TextInputCompiler extends AbstractInputCompiler implements InputCompiler {
  supports(form: Form, section: Section, input: Input): boolean {
    return input.type === InputType.TEXT;
  }

  schema(form: Form, section: Section, input: Input): JsonSchema {
    const { maxLength, minLength, description } = input as TextInput;
    return { type: 'string', maxLength, minLength, description } as JsonSchema;
  }

  ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
    return this.uiControl(form, section, input);
  }
}
