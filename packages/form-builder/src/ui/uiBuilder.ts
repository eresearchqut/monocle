import {V1Form} from '@trrf/form-definition'
import {UISchemaElement} from "@jsonforms/core";

export const buildUi = (form: V1Form | undefined): UISchemaElement | undefined => {
    if (form) {
        if (form.version === 'v1') {
            return buildV1Ui(form);
        }
    }
    return undefined;
};

const buildV1Ui = (form: V1Form): UISchemaElement | undefined => undefined;
