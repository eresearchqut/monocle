import { InputCompiler } from '../interfaces';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Form, Input, InputType, Section, SvgMapInput } from '@eresearchqut/form-definition';
import { AbstractInputCompiler } from './abstractInputCompiler';

export class SvgMapInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.SVG_MAP;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const { multiselect, description } = input as SvgMapInput;
        if (multiselect) {
            return {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        value: {
                            type: 'string',
                        },
                        label: {
                            type: 'string',
                        },
                    },
                },
                description,
            } as JsonSchema;
        }
        return {
            type: 'object',
            properties: {
                value: {
                    type: 'string',
                },
                label: {
                    type: 'string',
                },
            },
            description,
        } as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        return this.uiControl(form, section, input);
    }
}
