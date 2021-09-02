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
import {Fieldset} from 'primereact/fieldset';
import _ from 'lodash';
import {Scopable} from "@jsonforms/core/src/models/uischema";
import {Input} from "@trrf/form-definition";
import {Draggable} from "react-beautiful-dnd";


const InputLayoutRenderer = ({
                                 schema,
                                 rootSchema,
                                 indexOfFittingSchema,
                                 visible,
                                 path,
                                 renderers,
                                 cells,
                                 uischema,
                                 uischemas,
                                 data
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
    const input = data as Input;

    // filter out the input type from the ui and move the name to the first element
    inputUischema.elements = inputUischema.elements
        .map((uiSchemaElement) => uiSchemaElement as ControlElement)
        .filter((element) => element['scope'] !== '#/properties/inputType')
        .sort((a, b) => a.scope === '#/properties/name' ? -1 :
            a.scope.localeCompare(b.scope));
    ;


    return (

        <Fieldset legend={`${input.name} (${input.inputType})`}>
            <JsonFormsDispatch
                key={indexOfFittingSchema}
                schema={inputSchema}
                uischema={inputUischema}
                path={path}
                renderers={renderers}
                cells={cells}
            />
        </Fieldset>
    );
};

export const inputLayoutTester: RankedTester = rankWith(
    3,
    isAnyOfControl
);
// @ts-ignore
export default withJsonFormsAnyOfProps(InputLayoutRenderer);


