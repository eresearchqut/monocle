import { InputCompiler } from '../interfaces';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';
import { Form, Input, InputType, OptionsInput, Section } from '@eresearchqut/form-definition';
import { AbstractInputCompiler } from './abstractInputCompiler';

export class OptionsInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.OPTIONS;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const { description, optionValueType, multiselect, options } = input as OptionsInput;
        const choices = options?.map((option) => ({ const: option.value, title: option.label }));
        if (multiselect) {
            return { type: 'array', description, items: { type: optionValueType, oneOf: choices } } as JsonSchema;
        } else {
            return { type: optionValueType, description, oneOf: choices } as JsonSchema;
        }
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        const { displayOptions, multiselect, options } = input as OptionsInput;
        if (!(Array.isArray(options) && options.length)) {
            return undefined;
        }
        const format = displayOptions ? (multiselect ? 'checkbox' : 'radio') : 'select';
        const uiSchemaOptions = { format, multiselect };
        return this.uiControl(form, section, input, uiSchemaOptions);
    }
}
