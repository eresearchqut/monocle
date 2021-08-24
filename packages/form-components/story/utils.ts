import {createAjv, JsonSchema, UISchemaElement} from "@jsonforms/core";

export const initStore = (schema: JsonSchema, uischema: UISchemaElement, data?: any) => {
    return { schema, uischema, data, ajv: createAjv() };
};
