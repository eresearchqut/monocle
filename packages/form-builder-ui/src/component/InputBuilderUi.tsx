import React from 'react';
import {Input} from "@trrf/form-definition";
import {Card} from "primereact/card";
import {JsonForms} from "@jsonforms/react";
import {cells, renderers} from "@trrf/form-components";
import {materialCells, materialRenderers} from "@jsonforms/material-renderers";

export interface InputBuilderUiProps  {
    input: Input;
}

const inputSchema = require('../schema/input.json');

export const InputBuilderUi = ({input, ...props}: InputBuilderUiProps) => {

    const definitionKey: string | undefined = Object.keys(inputSchema.definitions).find((definitionKey) =>
        inputSchema.definitions[definitionKey].properties.inputType.enum[0] === input.inputType);

    if (!definitionKey) {
        return `Unknown input type ${input.inputType}`;
    }

    const schemaDefinition = inputSchema.definitions[definitionKey];

    return (<Card title={input.inputType}>
        <JsonForms
            schema={schemaDefinition}
            data={input}
            renderers={renderers}
            cells={cells}
        />
    </Card>);
}
