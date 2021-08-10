import {UISchemaElement} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";
import {generatePathFromName, buildPropertyPath} from "../utils";

import merge from "lodash/merge";

export abstract class AbstractInputBuilder  {

    uiControl(form: Form, section: Section, input: Input, options?: any): UISchemaElement | undefined {
        const inputProperty = generatePathFromName(input.name);
        if (inputProperty) {
            const sectionProperty = generatePathFromName(section.name);
            return {
                type: "Control",
                scope: buildPropertyPath([sectionProperty, inputProperty]),
                options: merge({}, {input}, options)
            } as UISchemaElement;
        }
        return undefined;
    }

}

