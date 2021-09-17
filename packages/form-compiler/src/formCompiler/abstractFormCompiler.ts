import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {Form, Section} from '@trrf/form-definition';
import {findSectionCompiler} from '../sectionCompiler';
import {generatePathFromName} from '../utils';


export abstract class AbstractFormCompiler {
    formProperties = (form?: Form): { [property: string]: JsonSchema | undefined } | undefined => form && form.sections ?
        form.sections.reduce((properties, section: Section) => {
          const propertyName = generatePathFromName(section.name);
          if (propertyName) {
            const sectionSchema = findSectionCompiler(form, section)?.schema(form, section);
            if (sectionSchema) {
              properties[propertyName] = sectionSchema;
            }
          }
          return properties;
        }, {} as { [property: string]: JsonSchema }) : undefined;


    uiElements = (form?: Form): UISchemaElement[] | undefined => form && form.sections ?
        form.sections
            .map((section) => findSectionCompiler(form, section)?.ui(form, section))
            .filter((uiSchemaElement): uiSchemaElement is UISchemaElement => !!uiSchemaElement) : undefined;
}

