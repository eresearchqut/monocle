import { SectionCompiler } from '../interfaces';

import { Category, JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Form, Section } from '@eresearchqut/form-definition';
import { AbstractSectionCompiler } from './abstractSectionCompiler';

export class CategorySectionCompiler extends AbstractSectionCompiler implements SectionCompiler {
  schema(form: Form, section: Section): JsonSchema {
    const properties = this.schemaProperties(form, section);
    const required = this.requiredProperties(form, section);
    if (properties) {
      return { type: 'object', properties, required } as JsonSchema;
    }
    return { type: 'object' } as JsonSchema;
  }

  ui(form: Form, section: Section): UISchemaElement | undefined {
    const elements = this.uiElements(form, section);
    if (elements) {
      return {
        type: 'Category',
        label: section.label || section.name,
        elements,
      } as Category;
    }
    return undefined;
  }
}
