import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Section} from "@trrf/form-definition";
import {findSectionBuilder} from "../sectionBuilder";
import {generatePropertyFromName} from "../utils";


export abstract class AbstractFormBuilder {


    formProperties = (form: Form): { [property: string]: JsonSchema | undefined } | undefined => form.sections ?
        form.sections.reduce((properties, section: Section) => {
            const propertyName = generatePropertyFromName(section.name);
            if (propertyName) {
                const sectionSchema = findSectionBuilder(form, section)?.schema(form, section);
                if (sectionSchema) {
                    properties[propertyName] = sectionSchema;
                }
            }
            return properties;
        }, {} as { [property: string]: JsonSchema }) : undefined;


    uiElements = (form: Form): UISchemaElement[] | undefined => form.sections ?
        form.sections
            .map(section => findSectionBuilder(form, section)?.ui(form, section))
            .filter((uiSchemaElement): uiSchemaElement is UISchemaElement => !!uiSchemaElement) : undefined;

}

