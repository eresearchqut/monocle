import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {ControlElement, JsonSchema} from "@jsonforms/core";
import InputBooleanCell, {InputBooleanCellOptions} from "./InputBooleanCell";


import {initStoryStore} from "../storyStore";




const path = 'cell';
const schema: JsonSchema = {
    type: 'boolean'
}
const uischema = (options: { [key: string]: any }): ControlElement => ({
    type: 'Control',
    scope: `#/properties/path`,
    options
});

export interface InputBooleanCellStoryArgs extends InputBooleanCellOptions {
    data?: boolean
}

export default {
    title: 'Cells/InputBooleanCell',
    component: InputBooleanCell,
    parameters: { actions: { argTypesRegex: '^handle.*' } },
    argTypes: {
        data: {
            options: [true, false, undefined],
            control: { type: 'radio' }
        }
    },
    decorators: [
        (Story, context) => {
            const args = context.args as InputBooleanCellStoryArgs;
            const store = initStoryStore({data: {[path]: args.data}, schema, uischema: uischema(args)});
            return (
                <Provider store={store}>
                    <JsonFormsReduxContext>
                        <Story />
                    </JsonFormsReduxContext>
                </Provider>
            )
        },

    ]
} as Meta;

const Template: Story<InputBooleanCellStoryArgs> =
    (args) =>
        <InputBooleanCell schema={schema} uischema={uischema(args)} path={path}  />
Template.bind({});

export const Optional = Template.bind({});
Optional.args = {
    data: true,
    required: false
}

export const Required = Template.bind({});
Required.args = {
    data: true,
    required: true
}








