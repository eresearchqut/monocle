import React, {FunctionComponent} from 'react';
import {
    HorizontalLayout, JsonSchema, Layout,
    RankedTester,
    rankWith,
    RendererProps,
    uiTypeIs
} from '@jsonforms/core';
import {JsonFormsDispatch, useJsonForms, withJsonFormsLayoutProps} from '@jsonforms/react';
import isEmpty from "lodash/isEmpty";

const renderChildren = (layout: Layout, schema: JsonSchema, path: string) => {
    if (isEmpty(layout.elements)) {
        return [];
    }
    const {renderers, cells} = useJsonForms();
    return layout.elements.map((child, index) => {
        return (
            <div key={`${path}-${index}`} className="p-col p-fluid">
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

const VerticalLayoutRenderer: FunctionComponent<RendererProps> = (
    {
        schema,
        uischema,
        visible,
        path
    }: RendererProps
) => {
    const horizontalLayout = uischema as HorizontalLayout;
    if (!visible) {
        return null;
    }
    return (
        <div className="p-grid p-dir-col">
            {renderChildren(horizontalLayout, schema, path)}
        </div>
    );
};


/**
 * Default tester for a vertical layout.
 * @type {RankedTester}
 */
export const verticalLayoutTester: RankedTester = rankWith(1, uiTypeIs('VerticalLayout'));

export default withJsonFormsLayoutProps(VerticalLayoutRenderer);
