import React, {useCallback, useState} from 'react';
import {
    ControlElement,
    createCombinatorRenderInfos,
    isAnyOfControl,
    JsonSchema,
    RankedTester,
    rankWith,
    resolveSubSchemas,
    StatePropsOfCombinator
} from '@jsonforms/core';
import {JsonFormsDispatch, withJsonFormsAnyOfProps} from '@jsonforms/react';
import {TabView, TabPanel, TabViewTabChangeParams} from 'primereact/tabview';

import CombinatorProperties from './CombinatorProperties';

const AnyOfLayout = ({
                         schema,
                         rootSchema,
                         indexOfFittingSchema,
                         visible,
                         path,
                         renderers,
                         cells,
                         uischema,
                         uischemas
                     }: StatePropsOfCombinator) => {
    const [selectedAnyOf, setSelectedAnyOf] = useState(indexOfFittingSchema || 0);
    const handleChange = useCallback(
        (event: TabViewTabChangeParams) => setSelectedAnyOf(event.index),
        [setSelectedAnyOf]
    );
    const anyOf = 'anyOf';

    if (!visible || !schema) {
        return undefined;
    }

    const _schema = resolveSubSchemas(schema, rootSchema, anyOf);
    const anyOfRenderInfos = createCombinatorRenderInfos(
        (_schema as JsonSchema).anyOf as JsonSchema[],
        rootSchema,
        anyOf,
        uischema as ControlElement,
        path,
        uischemas
    );

    return (
        <React.Fragment>
            <CombinatorProperties
                schema={_schema}
                combinatorKeyword={'anyOf'}
                path={path}
            />
            <TabView activeIndex={selectedAnyOf} onTabChange={handleChange}>
                {anyOfRenderInfos.map((anyOfRenderInfo, anyOfIndex) =>

                    <TabPanel key={anyOfRenderInfo.label} header={anyOfRenderInfo.label}>
                        <JsonFormsDispatch
                            key={anyOfIndex}
                            schema={anyOfRenderInfo.schema}
                            uischema={anyOfRenderInfo.uischema}
                            path={path}
                            renderers={renderers}
                            cells={cells}
                        />
                    </TabPanel>

                )}
            </TabView>
        </React.Fragment>
    );
};

export const anyOfLayoutTester: RankedTester = rankWith(
    3,
    isAnyOfControl
);
// @ts-ignore
export default withJsonFormsAnyOfProps(AnyOfLayout);


