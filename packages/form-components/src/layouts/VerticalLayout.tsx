import React, {FunctionComponent} from 'react';
import {
    JsonFormsCellRendererRegistryEntry,
    JsonFormsRendererRegistryEntry,
    JsonSchema,
    LayoutProps,
    RankedTester,
    rankWith,
    uiTypeIs, VerticalLayout
} from '@jsonforms/core';
import {JsonFormsDispatch, withJsonFormsLayoutProps} from '@jsonforms/react';
import isEmpty from "lodash/isEmpty";

const renderChildren = (layout: VerticalLayout,
                        schema: JsonSchema,
                        path: string,
                        renderers: JsonFormsRendererRegistryEntry[] | undefined,
                        cells: JsonFormsCellRendererRegistryEntry[] | undefined) => {

    if (isEmpty(layout.elements)) {
        return [];
    }

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
        path,
        renderers,
        cells
    }: LayoutProps
) => {
    const verticalLayout = uischema as VerticalLayout;
    if (!visible) {
        return null;
    }
    return (
        <div className="p-grid p-dir-col p-fluid">
            {renderChildren(verticalLayout, schema, path, renderers, cells)}
        </div>
    );
};


/**
 * Default tester for a vertical layout.
 * @type {RankedTester}
 */
export const verticalLayoutTester: RankedTester = rankWith(1, uiTypeIs('VerticalLayout'));

export default withJsonFormsLayoutProps(VerticalLayoutRenderer);
