import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Section} from "@trrf/form-definition";
import {findSectionBuilder} from "../sectionBuilder";
import {generatePropertyFromName} from "../utils";


export abstract class AbstractFormBuilder {


    formProperties = (form: Form): { [property: string]: JsonSchema | undefined } =>
        form.sections.reduce((properties, section: Section) => {
            properties[generatePropertyFromName(section.name)] = findSectionBuilder(form, section)?.schema(form, section);
            return properties;
        }, {} as { [property: string]: JsonSchema | undefined });


    uiElements = (form: Form): UISchemaElement[] =>
        form.sections
            .map(section => findSectionBuilder(form, section)?.ui(form, section))
            .filter((uiSchemaElement): uiSchemaElement is UISchemaElement => !!uiSchemaElement);

}

