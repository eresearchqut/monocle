import React, { FunctionComponent } from 'react';
import {
    Categorization,
    JsonFormsCellRendererRegistryEntry,
    JsonFormsRendererRegistryEntry,
    JsonSchema,
    LayoutProps,
    RankedTester,
    rankWith,
    uiTypeIs,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import isEmpty from 'lodash/isEmpty';

const renderChildren = (
    categorization: Categorization,
    schema: JsonSchema,
    path: string,
    renderers: JsonFormsRendererRegistryEntry[] | undefined,
    cells: JsonFormsCellRendererRegistryEntry[] | undefined
) => {
    if (isEmpty(categorization.elements)) {
        return [];
    }

    return categorization.elements.map((child, index) => {
        return (
            <div key={`${path}-${index}`} className="p-col">
                <JsonFormsDispatch renderers={renderers} cells={cells} uischema={child} schema={schema} path={path} />
            </div>
        );
    });
};

const CategorizationLayoutRenderer: FunctionComponent<LayoutProps> = ({
    schema,
    uischema,
    visible,
    path,
    renderers,
    cells,
}: LayoutProps) => {
    const categorization = uischema as Categorization;
    if (!visible) {
        return null;
    }
    return (
        /* 
        <div className="p-grid p-dir-col p-fluid">{renderChildren(categorization, schema, path, renderers, cells)}</div> 
        
        Notes - TS: removed the p-grid class from the div as the Biobank SampleContainer control was flowing out of the parent
        control with it.
        TODO: The change doesn't seem to have any other adverse effect, but this needs to be investigated later.
        */
        // <div className="p-dir-col p-fluid">{renderChildren(categorization, schema, path, renderers, cells)}</div>
        <div className="p-dir-col p-fluid">{renderChildren(categorization, schema, path, renderers, cells)}</div>
    );
};

export const categorizationLayoutTester: RankedTester = rankWith(1, uiTypeIs('Categorization'));

export default withJsonFormsLayoutProps(CategorizationLayoutRenderer);
