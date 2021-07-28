import {InputBuilder} from "../interfaces";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";
import {AbstractInputBuilder} from "./abstractInputBuilder";

export class TextInputBuilder extends AbstractInputBuilder implements InputBuilder {

    supports(form: Form, section: Section, input: Input): boolean {
        return input.inputType === 'text';
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        return {type: "string"} as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        return this.uiControl(form, section, input);
    }
}

