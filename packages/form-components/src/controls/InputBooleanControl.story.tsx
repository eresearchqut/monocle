import * as React from "react";

import {Meta, Story} from '@storybook/react';

import {ControlProps, createAjv} from "@jsonforms/core";
import { JsonFormsStateProvider } from '@jsonforms/react';
import InputBooleanControl from "./InputBooleanControl";

import {cells} from "../index";

export default {
    title: 'Controls/InputBooleanControl',
    component: InputBooleanControl,
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
        },
        cells: {
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
                <JsonFormsStateProvider initState={{core, cells}}>
                    <Story/>
                </JsonFormsStateProvider>
            )
        },
    ]
} as Meta;

const Template: Story<ControlProps> =
    (props) =>
        <InputBooleanControl schema={props.schema} uischema={props.uischema}  />
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: true,
    path: 'booleanControl',
    schema: {
        properties: {
            booleanControl: {
                type: 'boolean'
            }
        }
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/booleanControl`
    },
    cells
}

export const Required = Template.bind({});
Required.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: `#/properties/booleanControl`,
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
        scope: `#/properties/booleanControl`,
        options: {
            required: false
        }
    }
}

export const AlternativeLabel = Template.bind({});
AlternativeLabel.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: `#/properties/booleanControl`,
        label: 'I control booleans!'
    }
}

export const Description = Template.bind({});
Description.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: `#/properties/booleanControl`,
        options: {
            description: 'I am sometime true (for me to be true, please click)'
        }
    }
}



