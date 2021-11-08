import {JsonSchema, UISchemaElement} from '@jsonforms/core';
import {Form, Input, Section} from '@eresearchqut/form-definition';
import {findInputCompiler} from '../inputCompiler';
import {generatePathFromName} from '../utils';


export abstract class AbstractSectionCompiler {
    schemaProperties = (form: Form, section: Section): { [property: string]: JsonSchema | undefined } | undefined => section.inputs ?
        section.inputs.reduce((properties, input: Input) => {
          const propertyName = generatePathFromName(input.name);
          if (propertyName) {
            const inputSchema = findInputCompiler(form, section, input)?.schema(form, section, input);
            if (inputSchema) {
              properties[propertyName] = inputSchema;
            }
          }
          return properties;
        }, {} as { [property: string]: JsonSchema }) : undefined;


    requiredProperties = (form: Form, section: Section): string[] => section.inputs ?
        section.inputs.map((input: Input) => {
          const propertyName = generatePathFromName(input.name);
          if (propertyName && input['required']) {
            return propertyName;
          }
          return undefined;
        }).filter((propertyName): propertyName is string => !!propertyName) : [];


    uiElements = (form: Form, section: Section): UISchemaElement[] | undefined => section.inputs ?
        section.inputs
            .map((input) => findInputCompiler(form, section, input)?.ui(form, section, input))
            .filter((uiSchemaElement): uiSchemaElement is UISchemaElement => !!uiSchemaElement) : undefined;
}

