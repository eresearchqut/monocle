import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {Form, Input, InputType, Section} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';


export class DateTimeInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.DATE || input.type === InputType.DATE_TIME || input.type === InputType.TIME;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const {description, type} = input as Input;
        return {type: 'string', format: type, description} as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        return this.uiControl(form, section, input);
    }
}

