import React, {FunctionComponent} from 'react';
import {Form} from '@trrf/form-definition';
import {JsonForms} from '@jsonforms/react';
import {
    cells,
    InputBooleanControl,
    inputBooleanControlTester,
    InputControl,
    inputControlTester,

} from '@trrf/form-components';

import {JsonFormsCore, RankedTester} from '@jsonforms/core';
import InputsLayout, {inputsLayoutTester} from './InputsLayout';
import SectionsLayout, {sectionsLayoutTester} from "./SectionsLayout";
import AnyOfLayout, {anyOfLayoutTester} from './AnyOfLayout';
import VerticalLayout, {verticalLayoutTester} from './VerticalLayout';

const renderers: { tester: RankedTester; renderer: any }[] = [
    {tester: anyOfLayoutTester, renderer: AnyOfLayout},
     {tester: inputsLayoutTester, renderer: InputsLayout},
    {tester: sectionsLayoutTester, renderer: SectionsLayout},
    {tester: inputControlTester, renderer: InputControl},
    {tester: inputBooleanControlTester, renderer: InputBooleanControl},
    {tester: verticalLayoutTester, renderer: VerticalLayout},
];

export interface FormCanvasProps {
    definition: Form
    onChange?(state: Pick<JsonFormsCore, 'data' | 'errors'>): void;
}

// TODO, the form schema should probable be a prop
const schema = require('../schema/form.json');

export const FormDesignerCanvas: FunctionComponent<FormCanvasProps> = ({definition, onChange}) => {
    return (
        <div className='form-designer-canvas'>
            <JsonForms
                data={definition}
                schema={schema}
                renderers={renderers}
                cells={cells}
                onChange={onChange}
                config={{booleansAreTrueOrFalse: true}}
            />
        </div>
    );
};