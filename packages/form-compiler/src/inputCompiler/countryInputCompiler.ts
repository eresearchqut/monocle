import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {AddressInput, BooleanInput, CountryInput, Form, Input, InputType, Section} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';


export class CountryInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.COUNTRY;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const {description, multiselect} = input as CountryInput;

        if (multiselect) {
            return {
                type: 'array', description, items: {
                    type: 'object',
                    description,
                    properties: {
                        name: {
                            type: 'string'
                        },
                        shortCode: {
                            type: 'string'
                        }
                    }
                }
            } as JsonSchema;
        }

        return {
            type: 'object',
            description,
            properties: {
                name: {
                    type: 'string'
                },
                shortCode: {
                    type: 'string'
                }
            }
        } as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        const countryCodes = (input as AddressInput).restrictToCountries;
        return this.uiControl(form, section, input, {countryCodes});
    }
}

