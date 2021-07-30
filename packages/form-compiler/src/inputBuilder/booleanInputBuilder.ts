import {InputBuilder} from "../interfaces";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {BooleanInput, Form, Input, Section} from "@trrf/form-definition";
import {AbstractInputBuilder} from "./abstractInputBuilder";


export class BooleanInputBuilder extends AbstractInputBuilder implements InputBuilder {

    supports(form: Form, section: Section, input: Input): boolean {
        return input.inputType === 'boolean';
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        return {type: 'boolean'} as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        const {required} = input as BooleanInput;
        return this.uiControl(form, section, input, {required});
    }
}

