import React, { FunctionComponent } from 'react';
import {
    Category,
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
import merge from 'lodash/merge';
import { Fieldset } from 'primereact/fieldset';

const renderChildren = (
    category: Category,
    schema: JsonSchema,
    path: string,
    renderers: JsonFormsRendererRegistryEntry[] | undefined,
    cells: JsonFormsCellRendererRegistryEntry[] | undefined
) => {
    if (isEmpty(category.elements)) {
        return [];
    }

    return category.elements.map((child, index) => {
        return (
            <div key={`${path}-${index}`} className="p-col">
                <JsonFormsDispatch renderers={renderers} cells={cells} uischema={child} schema={schema} path={path} />
            </div>
        );
    });
};

const CategoryLayoutRenderer: FunctionComponent<LayoutProps> = ({
    schema,
    uischema,
    visible,
    path,
    renderers,
    cells,
    config,
}: LayoutProps) => {
    if (!visible) {
        return null;
    }

    const category = uischema as Category;
    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const { description } = appliedUiSchemaOptions;

    return (
        <Fieldset legend={category.label}>
            {description && <p>{description}</p>}
            <div className="p-grid p-dir-col p-fluid">{renderChildren(category, schema, path, renderers, cells)}</div>
        </Fieldset>
    );
};

export const categoryLayoutTester: RankedTester = rankWith(1, uiTypeIs('Category'));

export default withJsonFormsLayoutProps(CategoryLayoutRenderer);
