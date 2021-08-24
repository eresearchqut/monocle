import React, {FunctionComponent} from 'react';
import {
    HorizontalLayout,
    JsonSchema,
    Layout,
    LayoutProps,
    RankedTester,
    rankWith,
    uiTypeIs
} from '@jsonforms/core';
import {JsonFormsDispatch, useJsonForms, withJsonFormsLayoutProps} from '@jsonforms/react';

import isEmpty from "lodash/isEmpty";


const renderChildren = (layout: HorizontalLayout, schema: JsonSchema, path: string) => {
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

const HorizontalLayoutRenderer: FunctionComponent<LayoutProps> = (
    {
        schema,
        uischema,
        visible,
        path
    }: LayoutProps
) => {
    const horizontalLayout = uischema as HorizontalLayout;
    if (!visible) {
        return null;
    }
    return (
        <div className="p-grid p-fluid">
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
