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

export interface FormLayout extends Layout {
    type: 'Form';
}

const renderChildren = (layout: FormLayout, schema: JsonSchema, path: string) => {
    if (isEmpty(layout.elements)) {
        return [];
    }
    const {renderers, cells} = useJsonForms();
    return layout.elements.map((child, index) => {
        return (
            <div key={`${path}-${index}`} className="p-col">
                <JsonFormsDispatch
                    renderers={renderers}
                    cells={cells}
                    uischema={child}
                    schema={schema}
                    path={path}
                />
            </div>
        );
    });
};

const FormLayoutRenderer: FunctionComponent<RendererProps> = (
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
            {renderChildren(uischema as FormLayout, schema, path)}
        </div>
    );
};


export const formLayoutTester: RankedTester = rankWith(1, uiTypeIs('Form'));

export default withJsonFormsLayoutProps(FormLayoutRenderer);
