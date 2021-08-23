import React, {FunctionComponent} from 'react';
import {
    JsonSchema,
    Layout,
    RankedTester,
    rankWith,
    RendererProps,
    uiTypeIs
} from '@jsonforms/core';
import {JsonFormsDispatch, useJsonForms, withJsonFormsLayoutProps} from '@jsonforms/react';
import isEmpty from "lodash/isEmpty";

export interface InputLayout extends Layout {
    type: 'Input';
}



const InputLayoutRenderer: FunctionComponent<RendererProps> = (
    {
        schema,
        uischema,
        visible,
        path
    }: RendererProps
) => {
    if (!visible) {
        return null;
    }
    return (
        <div className="p-grid p-dir-col p-fluid">
            {renderChildren(uischema as SectionLayout, schema, path)}
        </div>
    );
};


export const sectionLayoutTester: RankedTester = rankWith(1, uiTypeIs('Input'));

export default withJsonFormsLayoutProps(InputLayoutRenderer);
