import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {CellProps} from "@jsonforms/core";
import InputSelectCell from "./InputSelectCell";

import {initStoryStore} from "../storyStore";

export default {
    title: 'Cells/InputSelectCell',
    component: InputSelectCell,
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
        <InputSelectCell schema={props.schema} uischema={props.uischema} path={props.path} />
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: 'b',
    path: 'cell',
    schema: {
        type: 'string',
        enum: ['a', 'b'],
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell'
    }
};







