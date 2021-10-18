import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {Form, Input, Section} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';




export class CalendarInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === 'date' || input.type === 'date-time' || input.type === 'time';
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const {description, type} = input as Input;
        switch(type) {
            case 'date-time':
                return {type: 'string', format: 'date-time', description} as JsonSchema;
                break;
            case 'time':
                return {type: 'string', format: 'date-time', description} as JsonSchema;
                break;
            default:
                return {type: 'string', format: 'date', description} as JsonSchema;
        }

        return {type: 'string', format: 'date', description} as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        return this.uiControl(form, section, input);
    }
}

