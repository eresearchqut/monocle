import React, {FunctionComponent} from 'react';
import {
    ControlElement,
    JsonSchema,
    LayoutProps,
    RankedTester,
    VerticalLayout,
    rankWith,
    uiTypeIs,
    JsonFormsRendererRegistryEntry,
    JsonFormsCellRendererRegistryEntry
} from '@jsonforms/core';
import {JsonFormsDispatch, withJsonFormsLayoutProps} from '@jsonforms/react';
import isEmpty from 'lodash/isEmpty';

const omittedScopes = ['#/properties/type', '#/properties/id'];
const sortFirst = [
    '#/properties/name', '#/properties/label', '#/properties/description', '#/properties/minimum',  '#/properties/maximum',
];
const sortLast = [
    '#/properties/inputs', '#/properties/sections'
];

const scopeOrder = (scope: string): number => sortLast.indexOf(scope) >= 0 ? 10000 :
    sortFirst.indexOf(scope) >= 0 ? sortFirst.indexOf(scope) : 100;

const sortControl = (controlElementA: ControlElement, controlElementB: ControlElement) =>
    scopeOrder(controlElementA.scope) - scopeOrder(controlElementB.scope);

const renderChildren = (layout: VerticalLayout,
                        schema: JsonSchema,
                        path: string,
                        renderers: JsonFormsRendererRegistryEntry[] | undefined,
                        cells: JsonFormsCellRendererRegistryEntry[] | undefined) => {

    if (isEmpty(layout.elements)) {
        return [];
    }
    return layout.elements
        .map((uiSchemaElement) => uiSchemaElement as ControlElement)
        .filter((element) => omittedScopes.indexOf(element['scope']) === -1)
        .sort(sortControl)
        .map((child, index) => {
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
        renderers, cells
    }: LayoutProps,
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
