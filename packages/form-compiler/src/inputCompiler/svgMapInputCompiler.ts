import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {Form, Input, Section} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';
import {SvgMapInput} from '@trrf/form-definition';

export class SvgMapInputCompiler extends AbstractInputCompiler implements InputCompiler {
  supports(form: Form, section: Section, input: Input): boolean {
    return input.type === 'svg-map';
  }

  schema(form: Form, section: Section, input: Input): JsonSchema {
    const {multiselect} = input as SvgMapInput;
    return {
      type: 'array',
      items: {
        type: 'string',
      },
    } as JsonSchema;
  }

  ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
    return this.uiControl(form, section, input);
  }
}

