import {Form, Input, Section} from '@trrf/form-definition';
import {JsonSchema, UISchemaElement} from '@jsonforms/core';

export default interface InputCompiler {

    supports(form: Form, section: Section, input: Input): boolean;

    schema(form: Form, section: Section, input: Input): JsonSchema | undefined;

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined;

};;;;;;;;;;
