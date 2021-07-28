import {InputBuilder} from "../interfaces";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";
import {generatePropertyFromName} from "../utils";

export abstract class AbstractInputBuilder  {
    uiControl(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        if (section.name && input.name) {
            const sectionProperty = generatePropertyFromName(section.name);
            const inputProperty = generatePropertyFromName(input.name);
            return {
                "type": "Control",
                "scope": `#/properties/${sectionProperty}/properties/${inputProperty}`
            } as UISchemaElement;
        }
        return undefined;
    }

}

