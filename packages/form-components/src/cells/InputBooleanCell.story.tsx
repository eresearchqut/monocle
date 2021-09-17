import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {CellProps} from "@jsonforms/core";
import InputBooleanCell from "./InputBooleanCell";


import {initStoryStore} from "../storyStore";

export default {
    title: 'Cells/InputBooleanCell',
    component: InputBooleanCell,
    decorators: [
        (Story, context) => {
            const {schema, uischema, data, path} = context.args as CellProps;
            const store = initStoryStore({data: {[path]: data}, schema, uischema});
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

const Template: Story<CellProps> =
    (props) =>
        <InputBooleanCell schema={props.schema} uischema={props.uischema} path={props.path} />
Template.bind({});

export const Optional = Template.bind({});
Optional.args = {
    data: true,
    path: 'cell',
    schema: {
        type: 'boolean'
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell'
    }
};

export const Required = Template.bind({});
Required.args = {
    ...Optional.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            required: true
        }
    }
};






