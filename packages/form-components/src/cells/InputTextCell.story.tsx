import * as React from "react";
import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {CellProps} from "@jsonforms/core";
import InputTextCell from "./InputTextCell";

import {initStoryStore} from "../storyStore";

export default {
    title: 'Cells/InputTextCell',
    component: InputTextCell,
    argTypes: {
        uischema: {
            table: {
                disable: true
            }
        },
        path: {
            table: {
                disable: true
            }
        }
    },
    decorators: [
        (Story, context) => {
            const store = initStoryStore( context.args as CellProps);
            return (
                <Provider store={store} >
                    <JsonFormsReduxContext>
                        <Story/>
                    </JsonFormsReduxContext>
                </Provider>
            )
        },
    ]
} as Meta;

const Template: Story<CellProps> =
    (props) =>
        <InputTextCell {...props}  />
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: 'I am a text value',
    path: 'textCell',
    schema: {
        type: 'string'
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/textCell`
    }
}

export const Pattern = Template.bind({});
Pattern.args = {
    ...Default.args,
    data: 'No numbers please (I am set to accept no numeric characters only)',
    schema: {
        type: 'string',
        pattern: "^([^0-9]*)$"
    }
}

export const Errors = Template.bind({});
Errors.args = {
    ...Default.args,
    data: 'Should be styled with with error intent',
    errors: 'Invalid data'
}









