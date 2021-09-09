import {FormCompiler} from "../interfaces";

import {JsonSchema, UISchemaElement, VerticalLayout} from "@jsonforms/core";
import {Form} from "@trrf/form-definition";

import {AbstractFormCompiler} from "./abstractFormCompiler";

export class VerticalFormCompiler extends AbstractFormCompiler implements FormCompiler {

    schema(form: Form): JsonSchema | undefined {
        const properties = this.formProperties(form);
        if (properties) {
            return {type: "object", properties} as JsonSchema;
        }
        return {type: "object"}
    }

    ui(form: Form): UISchemaElement | undefined {
        const elements = this.uiElements(form);
        if (elements) {
            return {
                "type": "VerticalLayout",
                elements
            } as VerticalLayout;

        }
        return {
            "type": "VerticalLayout",
        } as VerticalLayout;
    }

}