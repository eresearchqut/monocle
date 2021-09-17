import {SectionCompiler} from '../interfaces';

import {JsonSchema, UISchemaElement, VerticalLayout} from '@jsonforms/core';
import {Form, Section} from '@trrf/form-definition';
import {AbstractSectionCompiler} from './abstractSectionCompiler';


export class VerticalSectionCompiler extends AbstractSectionCompiler implements SectionCompiler {
  schema(form: Form, section: Section): JsonSchema {
    const properties = this.schemaProperties(form, section);
    const required = this.requiredProperties(form, section);
    if (properties) {
      return {type: 'object', properties, required} as JsonSchema;
    }
    return {type: 'object'} as JsonSchema;
  }

  ui(form: Form, section: Section): UISchemaElement | undefined {
    const elements = this.uiElements(form, section);
    if (elements) {
      return {
        'type': 'VerticalLayout',
        elements,
      } as VerticalLayout;
    }
    return undefined;
  }
}
