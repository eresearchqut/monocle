import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {OptionInput, Form, Input, InputType, Section} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';



export class OptionInputCompiler extends AbstractInputCompiler implements InputCompiler {

    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === InputType.OPTION;
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const {description, multiselect, options} = input as OptionInput;
        const choices = options.map(option => ({'const': option.value, title: option.label}))
        if (multiselect) {
            return {type: 'string', description, anyOf: choices} as JsonSchema;
        } else {
            return {type: 'string', description, oneOf: choices} as JsonSchema;
        }
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        const {displayOptions, multiselect} = input as OptionInput;
        const format = displayOptions ? multiselect ? 'checkbox' : 'radio' : 'select';
        const options = {format, multiselect}
        return this.uiControl(form, section, input, options);
    }
}

