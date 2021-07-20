import {Form, Section} from "@trrf/form-definition";
import {JsonSchema, Layout} from "@jsonforms/core";
import {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export default interface SectionBuilder {

    schema(form: Form, section: Section): JsonSchema;

    ui(form: Form, section: Section): UISchemaElement;

}
