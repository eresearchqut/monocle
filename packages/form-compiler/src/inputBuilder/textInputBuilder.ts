import {InputBuilder} from "../interfaces";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";
import {generatePropertyFromName} from "../utils";

export class TextInputBuilder implements InputBuilder {

    supports(form: Form, section: Section, input: Input): boolean {
        return input.inputType === 'text';
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        return {type: "string"} as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement {
        const sectionProperty = generatePropertyFromName(section.name);
        const inputProperty = generatePropertyFromName(input.name);
        return {
            "type": "Control",
            "scope": `#/properties/${sectionProperty}/properties/${inputProperty}`
        } as UISchemaElement;
    }

}

