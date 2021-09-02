import React, {FunctionComponent} from 'react';
import {
    JsonSchema,
    LayoutProps,
    RankedTester,
    rankWith,
    uiTypeIs,
    VerticalLayout
} from '@jsonforms/core';
import {JsonFormsDispatch, useJsonForms, withJsonFormsLayoutProps} from '@jsonforms/react';
import isEmpty from "lodash/isEmpty";


const renderChildren = (layout: VerticalLayout, schema: JsonSchema, path: string) => {

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

const VerticalLayoutRenderer: FunctionComponent<LayoutProps> = (
    {
        schema,
        uischema,
        visible,
        path
    }: LayoutProps
) => {
    const verticalLayout = uischema as VerticalLayout;
    if (!visible) {
        return null;
    }
    return (
        <div className="p-grid p-dir-col p-fluid">
            {renderChildren(verticalLayout, schema, path)}
        </div>
    );
};


/**
 * Default tester for a vertical layout.
 * @type {RankedTester}
 */
export const verticalLayoutTester: RankedTester = rankWith(1, uiTypeIs('VerticalLayout'));

export default withJsonFormsLayoutProps(VerticalLayoutRenderer);
