import {JsonSchema} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";
import {findInputBuilder} from "../inputBuilder";
import {generatePropertyFromName} from "../utils";


export abstract class AbstractSectionBuilder {


    schemaProperties = (form: Form, section: Section): { [property: string]: JsonSchema | undefined } =>
        section.inputs.reduce((properties, input: Input) => {
            properties[generatePropertyFromName(input.name)] = findInputBuilder(form, section, input)?.schema(form, section, input);
            return properties;
        }, {} as { [property: string]: JsonSchema | undefined });


}

