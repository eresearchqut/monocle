import React, {FunctionComponent} from 'react';

import {JsonSchema} from "@jsonforms/core";

const inputSchema = require('../schema/input.json') as JsonSchema;

export interface InputSelectorProps {

}

export const InputSelector: FunctionComponent<InputSelectorProps> = ({}) => {

    console.log(Object.keys(inputSchema.definitions))

    return (

        <div className="p-d-flex p-flex-column">
            { Object.keys(inputSchema.definitions).map((key, index) => (<div  key={key} className="p-mb-2 p-p-2 p-shadow-2">{key}</div>))}
        </div>


    );
};
