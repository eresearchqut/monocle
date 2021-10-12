import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {CellProps, ControlProps, createAjv} from "@jsonforms/core";
import InputBooleanCell from "./InputBooleanCell";


import {JsonFormsStateProvider} from "@jsonforms/react";


export default {
    title: 'Cells/InputBooleanCell',
    component: InputBooleanCell,
    argTypes: {
        data: {
            options: [true, false, undefined],
            control: {type: 'radio'}
        },
        uischema: {
            table: {
                disable: true
            }
        },
        schema: {
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
            const {schema, uischema, data, path} = context.args as ControlProps;
            const core = { schema, uischema, data: {[path]: data}, ajv: createAjv()};
            return (
                <JsonFormsStateProvider initState={{core}}>
                    <Story/>
                </JsonFormsStateProvider>
            )
        },
    ]
} as Meta;

const Template: Story<CellProps> =
    (props) =>
        <InputBooleanCell {...props}  />
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: true,
    path: 'booleanCell',
    schema: {
        type: 'boolean'
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/booleanCell`
    }
}

export const Required = Template.bind({});
Required.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: `#/properties/booleanCell`,
        options: {
            required: true
        }
    }
}

export const Optional = Template.bind({});
Optional.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: `#/properties/booleanCell`,
        options: {
            required: false
        }
    }
}



