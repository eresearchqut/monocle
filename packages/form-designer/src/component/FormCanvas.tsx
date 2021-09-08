import React, {FunctionComponent} from 'react';
import {Form} from "@trrf/form-definition";
import {JsonForms} from "@jsonforms/react";
import {
    cells,
    InputBooleanControl,
    inputBooleanControlTester,
    InputControl,
    inputControlTester
} from "@trrf/form-components";

import {JsonFormsCore, RankedTester} from '@jsonforms/core';
import ArrayLayout, {arrayLayoutTester} from "./ArrayLayout";
import VerticalLayout, {verticalLayoutTester} from "./VerticalLayout";
import AnyOfLayout, {anyOfLayoutTester} from "./AnyOfLayout";
import {forceReRender} from "@storybook/react";

const renderers: { tester: RankedTester; renderer: any }[] = [
    {tester: anyOfLayoutTester, renderer: AnyOfLayout},
    {tester: arrayLayoutTester, renderer: ArrayLayout},
    {tester: inputControlTester, renderer: InputControl},
    {tester: inputBooleanControlTester, renderer: InputBooleanControl},
    {tester: verticalLayoutTester, renderer: VerticalLayout}
];

export interface FormCanvasProps {
    definition?: Form
    onChange?(state: Pick<JsonFormsCore, 'data' | 'errors'>): void;
}

const schema = require('../schema/form.json');

export const FormCanvas: FunctionComponent<FormCanvasProps> = ({definition, onChange}) => {

    if (!definition) {
        return <React.Fragment/>
    }

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
