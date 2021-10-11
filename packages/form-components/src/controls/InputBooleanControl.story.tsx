import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {ControlProps} from "@jsonforms/core";
import InputBooleanControl from "./InputBooleanControl";

import {initStoryStore} from "../storyStore";
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
            return (
                <Provider store={initStoryStore(context.args as ControlProps)}>
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
        <InputBooleanControl {...props}  />
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



