import { InputCompiler } from '../interfaces';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Form, Input, InputType, Section, SvgMapInput } from '@eresearchqut/form-definition';
import { AbstractInputCompiler } from './abstractInputCompiler';

export class SampleContainerInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.SAMPLE_CONTAINER;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        return {
            type: 'object',
            properties: {
                width: { type: 'number' },
                length: { type: 'number' },
                samples: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            row: { type: 'number' },
                            col: { type: 'number' },
                            id: { type: 'string' },
                            highlighted: { type: 'boolean' },
                        },
                        required: ['id', 'col', 'row'],
                    },
                },
            },
            required: ['width', 'length'],
        } as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        return this.uiControl(form, section, input);
    }
}
