import {SectionBuilder} from "../interfaces";

import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";

import {findInputBuilder} from "../inputBuilder";


export class DefaultSectionBuilder implements SectionBuilder {


    schema(form: Form, section: Section): JsonSchema {
        const properties =
            section.inputs.reduce((properties, input: Input) => {
                properties[input.name] = findInputBuilder(form, section, input)?.schema(form, section, input);
                return properties;
            }, {} as { [property: string]: JsonSchema | undefined })
        return {type: "object", properties} as JsonSchema;
    }

    ui(form: Form, section: Section): UISchemaElement {
        return {} as UISchemaElement;
    }


}

