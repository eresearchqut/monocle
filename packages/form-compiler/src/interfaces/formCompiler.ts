import { Form } from '@eresearchqut/form-definition';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';

export default interface FormCompiler {
  schema(form?: Form): JsonSchema | undefined;

  ui(form?: Form): UISchemaElement | undefined;
}
