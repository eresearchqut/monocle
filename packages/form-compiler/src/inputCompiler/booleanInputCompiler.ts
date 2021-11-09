import { InputCompiler } from '../interfaces';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { BooleanInput, Form, Input, InputType, Section } from '@eresearchqut/form-definition';
import { AbstractInputCompiler } from './abstractInputCompiler';

export class BooleanInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.BOOLEAN;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const { description } = input as BooleanInput;
        return { type: 'boolean', description } as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        return this.uiControl(form, section, input);
    }
}
