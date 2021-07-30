import {UISchemaElement} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";
import {generatePropertyFromName} from "../utils";

import merge from "lodash/merge";

export abstract class AbstractInputBuilder  {
    uiControl(form: Form, section: Section, input: Input, options?: any): UISchemaElement | undefined {
        if (section.name && input.name) {
            const sectionProperty = generatePropertyFromName(section.name);
            const inputProperty = generatePropertyFromName(input.name);
            return {
                type: "Control",
                scope: `#/properties/${sectionProperty}/properties/${inputProperty}`,
                options: merge({}, {input}, options)
            } as UISchemaElement;
        }
        return undefined;
    }

}

