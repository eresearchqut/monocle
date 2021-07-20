import {Form, Section, Input} from "@trrf/form-definition";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";

export default interface InputBuilder {

    supports(form: Form, section: Section, input: Input): boolean;

    schema(form: Form, section: Section, input: Input): JsonSchema;

    ui(form: Form, section: Section, input: Input): UISchemaElement;

}
