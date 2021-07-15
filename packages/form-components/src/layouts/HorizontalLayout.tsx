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
import {Grid, Row, Col} from 'rsuite';

const renderChildren = (layout: Layout, schema: JsonSchema, path: string) => {
    if (isEmpty(layout.elements)) {
        return [];
    }
    const {renderers, cells} = useJsonForms();
    return layout.elements.map((child, index) => {
        return (
            <Col key={`${path}-${index}`}>
                <JsonFormsDispatch
                    renderers={renderers}
                    cells={cells}
                    uischema={child}
                    schema={schema}
                    path={path}
                />
            </Col>
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
        <Grid>
            <Row>
                {renderChildren(horizontalLayout, schema, path)}
            </Row>
        </Grid>
    );
};


/**
 * Default tester for a horizontal layout.
 * @type {RankedTester}
 */
export const horizontalLayoutTester: RankedTester = rankWith(1, uiTypeIs('HorizontalLayout'));

export default withJsonFormsLayoutProps(HorizontalLayoutRenderer);
