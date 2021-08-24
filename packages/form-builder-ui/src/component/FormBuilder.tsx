import React, {FunctionComponent} from 'react';
import {Form} from "@trrf/form-definition";
import {JsonForms} from "@jsonforms/react";
import {cells, renderers} from "@trrf/form-components";
import {JsonFormsCore, Generate} from '@jsonforms/core';

export interface FormBuilderProps {
    definition: Form
    onChange?(state: Pick<JsonFormsCore, 'data' | 'errors'>): void;
}

const schema = require('../schema/form.json');
const uischema =
    {
        type: "VerticalLayout",
        elements: [
            {
                type: "Control",
                scope: "#/properties/name"
            },
            {
                type: "Control",
                scope: "#/properties/sections"
            }
        ]
    }

     console.log(JSON.stringify(renderers));

export const FormBuilder: FunctionComponent<FormBuilderProps> = ({definition, onChange}) => {
    return (
        <JsonForms
            data={definition}
            schema={schema}
            renderers={renderers}
            cells={cells}
            onChange={onChange}
        />
    );
};
