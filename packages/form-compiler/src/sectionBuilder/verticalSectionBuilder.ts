import {SectionBuilder} from "../interfaces";

import {JsonSchema, UISchemaElement, VerticalLayout} from "@jsonforms/core";
import {Form, Section} from "@trrf/form-definition";
import {AbstractSectionBuilder} from "./abstractSectionBuilder";


export class VerticalSectionBuilder extends AbstractSectionBuilder implements SectionBuilder {

    schema(form: Form, section: Section): JsonSchema {
        const properties = this.schemaProperties(form, section);
        if (properties) {
            return {type: "object", properties} as JsonSchema;
        }
        return {type: "object"} as JsonSchema;
    }

    ui(form: Form, section: Section): UISchemaElement | undefined {
        const elements = this.uiElements(form, section);
        if (elements) {
            return {
                "type": "VerticalLayout",
                elements
            } as VerticalLayout;
        }
        return undefined;
    }

}
