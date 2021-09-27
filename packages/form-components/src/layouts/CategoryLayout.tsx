import React, {FunctionComponent} from 'react';
import {
    JsonFormsCellRendererRegistryEntry,
    JsonFormsRendererRegistryEntry,
    JsonSchema,
    LayoutProps,
    RankedTester,
    rankWith,
    uiTypeIs, Category
} from '@jsonforms/core';
import {JsonFormsDispatch, withJsonFormsLayoutProps} from '@jsonforms/react';
import isEmpty from "lodash/isEmpty";

const renderChildren = (category: Category,
                        schema: JsonSchema,
                        path: string,
                        renderers: JsonFormsRendererRegistryEntry[] | undefined,
                        cells: JsonFormsCellRendererRegistryEntry[] | undefined) => {

    if (isEmpty(category.elements)) {
        return [];
    }

    return category.elements.map((child, index) => {
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

const CategoryLayoutRenderer: FunctionComponent<LayoutProps> = (
    {
        schema,
        uischema,
        visible,
        path,
        renderers,
        cells
    }: LayoutProps
) => {
    const category = uischema as Category;
    if (!visible) {
        return null;
    }
    return (
        <div className="p-grid p-dir-col p-fluid">
            {renderChildren(category, schema, path, renderers, cells)}
        </div>
    );
};



export const categoryLayoutTester: RankedTester = rankWith(1, uiTypeIs('Category'));

export default withJsonFormsLayoutProps(CategoryLayoutRenderer);
