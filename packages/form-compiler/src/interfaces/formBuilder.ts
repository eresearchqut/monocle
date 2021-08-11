import {Form} from "@trrf/form-definition";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";

export default interface FormBuilder {

    schema(form: Form): JsonSchema | undefined;

    ui(form: Form): UISchemaElement | undefined;

}
