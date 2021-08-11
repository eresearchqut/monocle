import {Form, Section, Input} from "../../form-definition";
import {findInputBuilder, findSectionBuilder, generatePathFromName} from "../../form-compiler";
import {JsonSchema, UISchemaElement, createAjv} from "@jsonforms/core";

export const path = (input: Input) => input && generatePathFromName(input.name) ? generatePathFromName(input.name) : 'pathUndefined';
export const ui = (input: Input): UISchemaElement | undefined =>
    findInputBuilder({} as Form, {} as Section, input).ui({} as Form, {} as Section, input);
export const cellSchema = (input: Input): JsonSchema | undefined =>
    findInputBuilder({} as Form, {} as Section, input).schema({} as Form, {} as Section, input);
export const controlSchema = (input: Input): JsonSchema | undefined =>
    findSectionBuilder({} as Form, {inputs: [input]} as Section).schema({} as Form, {inputs: [input]} as Section);


export const initStore = (schema: JsonSchema, uischema: UISchemaElement, data?: any) => {
    return { schema, uischema, data, ajv: createAjv() };
};
