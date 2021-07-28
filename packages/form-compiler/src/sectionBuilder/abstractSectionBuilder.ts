import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";
import {findInputBuilder} from "../inputBuilder";
import {generatePropertyFromName} from "../utils";


export abstract class AbstractSectionBuilder {

    schemaProperties = (form: Form, section: Section): { [property: string]: JsonSchema | undefined } | undefined => section.inputs ?
        section.inputs.reduce((properties, input: Input) => {
            const propertyName = generatePropertyFromName(input.name);
            if (propertyName) {
                const inputSchema = findInputBuilder(form, section, input)?.schema(form, section, input);
                if (inputSchema) {
                    properties[propertyName] = inputSchema;
                }
            }
            return properties;
        }, {} as { [property: string]: JsonSchema }) : undefined;


    uiElements = (form: Form, section: Section): UISchemaElement[] | undefined => section.inputs ?
        section.inputs
            .map(input => findInputBuilder(form, section, input)?.ui(form, section, input))
            .filter((uiSchemaElement): uiSchemaElement is UISchemaElement => !!uiSchemaElement) : undefined;

}

