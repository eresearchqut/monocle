import {Form, Section} from '@trrf/form-definition';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';

export default interface SectionCompiler {

    schema(form: Form, section: Section): JsonSchema | undefined;

    ui(form: Form, section: Section): UISchemaElement | undefined;

}
