import {Form, Section} from "@trrf/form-definition";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";

export default interface SectionBuilder {

    schema(form: Form, section: Section): JsonSchema;

    ui(form: Form, section: Section): UISchemaElement;

}
