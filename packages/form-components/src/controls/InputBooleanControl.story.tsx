import * as React from "react";

import {Story, Meta} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {ControlProps} from "@jsonforms/core";
import InputBooleanControl from "./InputBooleanControl";

import {initTestStore} from "../../test/testStore";
import {cells, renderers} from "../index";

export default {
    title: 'Control/InputBooleanControl',
    component: InputBooleanControl,
    decorators: [
        (Story, context) => {
            const {schema, uischema, data, path} = context.args as ControlProps;
            const store = initTestStore({
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
        <InputBooleanControl schema={props.schema} uischema={props.uischema} />
Template.bind({});

export const Optional = Template.bind({});
Optional.args = {
    data: true,
    path: 'control',
    schema: {
        properties: {
            control: {
                type: 'boolean'
            }
        }
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/control'
    }
};

export const Required = Template.bind({});
Required.args = {
    ...Optional.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/control',
        options: {
            required: true
        }
    }
};






