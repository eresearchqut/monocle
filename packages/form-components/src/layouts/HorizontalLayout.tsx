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

const HorizontalLayoutRenderer: FunctionComponent<RendererProps> = (
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
        <div className="p-grid">
            {renderChildren(horizontalLayout, schema, path)}
        </div>
    );
};


/**
 * Default tester for a horizontal layout.
 * @type {RankedTester}
 */
export const horizontalLayoutTester: RankedTester = rankWith(1, uiTypeIs('HorizontalLayout'));

export default withJsonFormsLayoutProps(HorizontalLayoutRenderer);
