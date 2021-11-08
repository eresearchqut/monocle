import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {CountryInput, Form, Input, InputType, Section} from '@eresearchqut/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';

export class CountryInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.COUNTRY;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const {description, multiselect, name} = input as CountryInput;

        if (multiselect) {
            return {
                type: 'array', description,
                items: {
                    type: 'string'
                }
            } as JsonSchema;
        }

        return {
            type: 'string',
            description
        } as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        const countryCodes = (input as CountryInput).countryCodes;
        return this.uiControl(form, section, input, {countryCodes});
    }
}

