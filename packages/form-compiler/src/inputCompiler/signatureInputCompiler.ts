import { InputCompiler } from '../interfaces';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Form, Input, InputType, Section } from '@eresearchqut/form-definition';
import { AbstractInputCompiler } from './abstractInputCompiler';

export class SignatureInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.SIGNATURE;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        return { type: 'string' } as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        return this.uiControl(form, section, input);
    }
}
