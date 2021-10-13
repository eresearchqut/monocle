import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {CellProps, ControlProps, createAjv} from "@jsonforms/core";
import InputNumberCell from "./InputNumberCell";

import {JsonFormsStateProvider} from "@jsonforms/react";

export default {
    title: 'Cells/InputNumberCell',
    component: InputNumberCell,
    argTypes: {
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
            const {schema, uischema, data} = context.args as ControlProps;
            const core = {schema, uischema, data, ajv: createAjv()};
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
        <InputNumberCell {...props}  />
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    schema: {
        type: 'number'
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/numeric`
    }
}

export const WholeNumbersOnly = Template.bind({});
WholeNumbersOnly.args = {
    ...Default.args
}

export const MinMax = Template.bind({});
MinMax.args = {
    ...Default.args,
    data: 12,
    schema: {
        type: 'number',
        minimum: 10,
        maximum: 25
    },
}





