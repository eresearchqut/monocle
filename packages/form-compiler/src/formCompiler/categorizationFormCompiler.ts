import { FormCompiler } from '../interfaces';

import { Categorization, JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Form } from '@eresearchqut/form-definition';

import { AbstractFormCompiler } from './abstractFormCompiler';

export class CategorizationFormCompiler extends AbstractFormCompiler implements FormCompiler {
    schema(form: Form): JsonSchema | undefined {
        const properties = this.formProperties(form);
        if (properties) {
            return { type: 'object', properties } as JsonSchema;
        }
        return { type: 'object' };
    }

    ui(form: Form): UISchemaElement | undefined {
        const elements = this.uiElements(form);
        if (elements) {
            return {
                type: 'Categorization',
                label: form.label || form.name,
                elements,
            } as Categorization;
        }
        return {
            type: 'Categorization',
        } as Categorization;
    }
}
