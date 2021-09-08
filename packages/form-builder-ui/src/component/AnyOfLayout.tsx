import React, {useCallback, useState} from 'react';
import {
    ControlElement,
    createCombinatorRenderInfos,
    isAnyOfControl,
    JsonSchema,
    RankedTester,
    rankWith,
    resolveSubSchemas,
    StatePropsOfCombinator, VerticalLayout
} from '@jsonforms/core';
import {JsonFormsDispatch, withJsonFormsAnyOfProps} from '@jsonforms/react';

const AnyOfRenderer = ({
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

    const inputSchema = anyOfRenderInfos[indexOfFittingSchema].schema;
    const inputUischema = anyOfRenderInfos[indexOfFittingSchema].uischema as VerticalLayout;

    // filter out the input type from the ui and move the name to the first element
    inputUischema.elements = inputUischema.elements
        .map((uiSchemaElement) => uiSchemaElement as ControlElement)
        .filter((element) => element['scope'] !== '#/properties/type')
        .sort((a, b) => a.scope === '#/properties/name' ? -1 :
            a.scope.localeCompare(b.scope));
    ;


    return (
        <JsonFormsDispatch
            key={indexOfFittingSchema}
            schema={inputSchema}
            uischema={inputUischema}
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
export default withJsonFormsAnyOfProps(AnyOfRenderer);


