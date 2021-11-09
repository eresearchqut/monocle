import * as React from "react";

import {Meta, Story} from '@storybook/react';

import {ControlProps, createAjv, JsonFormsCore,} from "@jsonforms/core";
import {JsonFormsStateProvider, JsonFormsReactProps, useJsonForms} from '@jsonforms/react';
import InputBooleanControl from "./InputBooleanControl";

import {cells} from "../index";
import {useArgs} from "@storybook/client-api";
import {useCallback, useEffect} from "react";
import {action} from "@storybook/addon-actions";


const ChangeEmitter: React.FC<JsonFormsReactProps> = ({onChange}) => {
    const ctx = useJsonForms();
    const {data, errors} = ctx.core as JsonFormsCore;
    useEffect(() => {
        if (onChange) {
            onChange({data, errors});
        }
    }, [data, errors]); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
};

export default {
    title: 'Controls/InputBooleanControl',
    component: InputBooleanControl,
    decorators: [
        (Story, context) => {
            const {schema, uischema, data} = context.args as ControlProps;
            const core = {schema, uischema, data, ajv: createAjv()};
            const [, updateArgs] = useArgs();
            const logAction = useCallback(action('onChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
            return (
                <JsonFormsStateProvider initState={{core, cells}}>
                    <ChangeEmitter
                        onChange={({data}) => {
                            updateArgs({data});
                            logAction(data);
                        }}
                    />
                    <Story/>
                </JsonFormsStateProvider>
            )
        },
    ]
} as Meta;

const Template: Story<ControlProps> =
    (props) =>
        <InputBooleanControl schema={props.schema} uischema={props.uischema}/>
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: {control: true},
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
        scope: `#/properties/control`
    },
    cells
}

export const Required = Template.bind({});
Required.args = {
    ...Default.args,
    schema: {
        required: ['control'],
        properties: {
            control: {
                type: 'boolean'
            }
        }
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/control`,
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
        scope: `#/properties/control`,
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
        scope: `#/properties/control`,
        label: 'I control booleans!'
    }
}

export const Description = Template.bind({});
Description.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: `#/properties/control`,
        options: {
            description: 'I am sometime true (for me to be true, please click)'
        }
    }
}



