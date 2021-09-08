import React, {FunctionComponent} from 'react';
import {Form} from "@trrf/form-definition";
import {JsonForms} from "@jsonforms/react";
import {
    cells,
    renderers
} from "@trrf/form-components";

import {findFormCompiler} from "@trrf/form-compiler";

import {JsonFormsCore} from '@jsonforms/core';




export interface FormPreviewProps {
    definition: Form;
    data: any;
    onChange?(state: Pick<JsonFormsCore, 'data' | 'errors'>): void;
}



export const FormPreview: FunctionComponent<FormPreviewProps> = ({definition, data, onChange}) => {

    const formCompiler = findFormCompiler(definition);
    const schema = formCompiler?.schema(definition);
    const ui = formCompiler?.ui(definition);



    return (

        <JsonForms
            data={data}
            uischema={ui}
            schema={schema}
            renderers={renderers}
            cells={cells}
            onChange={onChange}
        />

    );
};
