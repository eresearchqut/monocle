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


        <JsonFormsDispatch
            key={selectedAnyOf}
            schema={anyOfRenderInfos[selectedAnyOf].schema}
            uischema={anyOfRenderInfos[selectedAnyOf].uischema}
            path={path}
            renderers={renderers}
            cells={cells}
        />

    );
};

export const anyOfLayoutTester: RankedTester = rankWith(
    3,
    isAnyOfControl
);
// @ts-ignore
export default withJsonFormsAnyOfProps(AnyOfLayout);


