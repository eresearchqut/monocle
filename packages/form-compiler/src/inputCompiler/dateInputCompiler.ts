import {InputCompiler} from '../interfaces';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {Form, Input, Section, SvgMapInput} from '@trrf/form-definition';
import {AbstractInputCompiler} from './abstractInputCompiler';


export class DateInputCompiler extends AbstractInputCompiler implements InputCompiler {
    supports(form: Form, section: Section, input: Input): boolean {
        return input.type === 'date';
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const {description} = input as SvgMapInput;
        return {type: 'string', format: 'date', description} as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        return this.uiControl(form, section, input);
    }
}

