import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {Form, Input, Section} from '@eresearchqut/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';
import {MarkdownInput} from '@eresearchqut/form-definition';

export class MarkdownInputCompiler extends AbstractInputCompiler implements InputCompiler {
  supports(form: Form, section: Section, input: Input): boolean {
    return input.type === 'markdown';
  }

  schema(form: Form, section: Section, input: Input): JsonSchema {
    const {description} = input as MarkdownInput;
    return {type: 'string', description} as JsonSchema;
  }

  ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
    return this.uiControl(form, section, input);
  }
}

