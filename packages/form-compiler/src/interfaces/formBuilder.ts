import {Form} from "@trrf/form-definition";
import {JsonSchema} from "@jsonforms/core";
import {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export default interface FormBuilder {

    schema(form: Form): JsonSchema | undefined;

    ui(form: Form): UISchemaElement | undefined;

}
