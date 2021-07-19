import {SectionBuilder} from "../interfaces";

import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Section} from "@trrf/form-definition";
import {AbstractSectionBuilder} from "./abstractSectionBuilder";


export class VerticalSectionBuilder extends AbstractSectionBuilder implements SectionBuilder {


    schema(form: Form, section: Section): JsonSchema {
        const properties = this.schemaProperties(form, section);
        return {type: "object", properties} as JsonSchema;
    }

    ui(form: Form, section: Section): UISchemaElement {
        return {} as UISchemaElement;
    }


}

