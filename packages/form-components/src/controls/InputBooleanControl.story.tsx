import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {CellProps} from "@jsonforms/core";
import InputBooleanControl from "./InputBooleanControl";

import {initStoryStore} from "../storyStore";

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
        }
    },
    decorators: [
        (Story, context) => {
            return (
                <Provider store={initStoryStore(context.args as CellProps)} >
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
        <InputBooleanControl {...props}  />
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: true,
    path: 'booleanControl',
    schema: {
        booleanControl: {
            type: 'boolean'
        }
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/booleanControl`
    }
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



