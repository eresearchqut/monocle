import * as React from "react";
import {Meta, Story} from '@storybook/react';
import {CellProps, ControlProps, createAjv} from "@jsonforms/core";
import InputTextCell from "./InputTextCell";
import {JsonFormsStateProvider} from "@jsonforms/react";

export default {
    title: 'Cells/InputTextCell',
    component: InputTextCell,
    argTypes: {
        schema: {
            table: {
                disable: true
            }
        },
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


export const Multiline = Template.bind({});
Multiline.args = {
    ...Default.args,
    data: 'I am a \n\n multiline text entry',
    uischema: {
        type: 'Control',
        scope: `#/properties/textCell`,
        options: {
            multiline: true
        }
    }
}







