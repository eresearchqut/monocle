import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {Form, Input, Section} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';
import {TextInput} from '@trrf/form-definition/dist/interfaces';

export class TextInputCompiler extends AbstractInputCompiler implements InputCompiler {
  supports(form: Form, section: Section, input: Input): boolean {
    return input.type === 'text';
  }

  schema(form: Form, section: Section, input: Input): JsonSchema {
    const {maxLength, minLength} = input as TextInput;
    return {type: 'string', maxLength, minLength} as JsonSchema;
  }

  ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
    const {multiline} = input as TextInput;
    return this.uiControl(form, section, input, {
      multi: multiline,
    });
  }
}

