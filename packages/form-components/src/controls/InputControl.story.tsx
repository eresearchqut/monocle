import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {ControlProps} from "@jsonforms/core";
import InputControl from "./InputControl";

import {initStoryStore} from "../storyStore";
import {cells, renderers} from "../index";

export default {
    title: 'Control/InputControl',
    component: InputControl,
    decorators: [
        (Story, context) => {
            const {schema, uischema, data, path} = context.args as ControlProps;
            const store = initStoryStore({
                    data: {[path]: data}, schema, uischema,
                    renderers, cells
                },
            );
            return (
                <Provider store={store}>
                    <JsonFormsReduxContext>
                        <Story/>
                    </JsonFormsReduxContext>
                </Provider>
            )
        },

    ]
} as Meta;

const Template: Story<ControlProps> =
    (props) =>
        <InputControl schema={props.schema} uischema={props.uischema} />
Template.bind({});

export const Text = Template.bind({});
Text.args = {
    data: 'I am some text',
    path: 'control',
    schema: {
        properties: {
            control: {
                type: 'string'
            }
        }
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/control'
    }
};

export const MultilineText = Template.bind({});
MultilineText.args = {
    ...Text.args,
    data: 'I am some\n\nmultiline text',
    uischema: {
        type: 'Control',
        scope: '#/properties/control',
        options: {
            multi: true
        }
    }
};






