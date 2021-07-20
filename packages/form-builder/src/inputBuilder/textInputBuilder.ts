import {InputBuilder} from "../interfaces";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";

export class TextInputBuilder implements InputBuilder {

    supports(form: Form, section: Section, input: Input): boolean {
        return input.inputType === 'text';
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        return {type: "string"} as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement {
        return {} as UISchemaElement;
    }

}

