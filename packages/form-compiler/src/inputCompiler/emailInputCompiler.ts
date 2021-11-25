import { InputCompiler } from '../interfaces';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { EmailInput, Form, Input, InputType, Section } from '@eresearchqut/form-definition';
import { AbstractInputCompiler } from './abstractInputCompiler';

export class EmailInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.EMAIL;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const { description } = input as EmailInput;
        return {
            type: 'string',
            format: 'email',
            description,
        } as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        return this.uiControl(form, section, input);
    }
}
