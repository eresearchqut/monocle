import {SectionBuilder} from "../interfaces";

import {JsonSchema, UISchemaElement, VerticalLayout} from "@jsonforms/core";
import {Form, Section} from "@trrf/form-definition";
import {AbstractSectionBuilder} from "./abstractSectionBuilder";


export class VerticalSectionBuilder extends AbstractSectionBuilder implements SectionBuilder {

    schema(form: Form, section: Section): JsonSchema {
        const properties = this.schemaProperties(form, section);
        return {type: "object", properties} as JsonSchema;
    }

    ui(form: Form, section: Section): UISchemaElement {
        const elements = this.uiElements(form, section);
        return {
            "type": "VerticalLayout",
            elements
        } as VerticalLayout;
    }

}
