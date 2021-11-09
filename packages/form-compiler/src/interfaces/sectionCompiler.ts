import { Form, Section } from '@eresearchqut/form-definition';
import { JsonSchema, UISchemaElement } from '@jsonforms/core';

export default interface SectionCompiler {
    schema(form: Form, section: Section): JsonSchema | undefined;

    ui(form: Form, section: Section): UISchemaElement | undefined;
}
