import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {AddressInput, BooleanInput, Form, Input, InputType, Section} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';


export class AddressInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.ADDRESS;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const {description} = input as AddressInput;
        return {
            type: 'object',
            description,
            properties: {
                streetNumber: {
                    type: 'string'
                },
                street: {
                    type: 'string'
                },
                suburb: {
                    type: 'string'
                },
                city: {
                    type: 'string'
                },
                state: {
                    type: 'string'
                },
                country: {
                    type: 'string'
                },
                postalCode: {
                    type: 'string'
                }
            }
        } as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        const countryCodes = (input as AddressInput).countryCodes;
        return this.uiControl(form, section, input,
            {countryCodes}
        );
    }
}

