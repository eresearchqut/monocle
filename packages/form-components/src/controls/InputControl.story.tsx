import * as React from "react";

import {Meta, Story} from '@storybook/react';

import {ControlProps, createAjv, JsonFormsCore} from "@jsonforms/core";
import {JsonFormsReactProps, JsonFormsStateProvider, useJsonForms} from '@jsonforms/react';
import InputControl from "./InputControl";

import {useArgs} from "@storybook/client-api";
import {useCallback} from "react";
import {action} from "@storybook/addon-actions";
import {cells} from "../index";


const ChangeEmitter: React.FC<JsonFormsReactProps> = ({onChange}) => {
    const ctx = useJsonForms();
    const {data, errors} = ctx.core as JsonFormsCore;
    React.useEffect(() => {
        if (onChange) {
            onChange({data, errors});
        }
    }, [data, errors]);
    return null;
};

export default {
    title: 'Controls/InputControl',
    component: InputControl,
    decorators: [
        (Story, context) => {
            const {schema, uischema, data} = context.args as ControlProps;
            const core = {schema, uischema, data, ajv: createAjv()};
            const [, updateArgs] = useArgs();
            const logAction = useCallback(action('onChange'), []);
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
        <InputControl {...props} id="static"/>
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: {
        firstName: 'Lando',
        endNotes: 'I appear at the end',
        lastName: '',
        position: 'Intergalactic Gambler',
        classification: 'A',
        age: 52,
        notes: 'Will betray Han\n(at earliest convenience)',
    },
    schema: {
        required: ['position', 'endNotes'],
        properties: {
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string',
                description: 'Family or surname, should come after your first name'
            },
            position: {
                type: 'string',
                enum: ['Intergalactic Gambler', 'Bounty Hunter', 'Smuggler']
            },
            classification: {
                type: 'string',
                minLength: 2,
                description: 'I have a minimum length of two characters'
            },
            notes: {
                type: 'string'
            },

            endNotes: {
                type: 'string'
            },
            age: {
                type: 'number',
                minimum: 0,
                maximum: 125
            },
        }
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/firstName'
    },
    cells
}

export const TextRequired = Template.bind({});
TextRequired.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/position'
    }
}

export const TextDescription = Template.bind({});
TextDescription.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/lastName'
    }
}

export const TextInvalid = Template.bind({});
TextInvalid.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/classification'
    }
}

export const MultilineText = Template.bind({});
MultilineText.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/notes',
        options: {
            multi: true
        }
    }
}

export const MultilineTextRequired = Template.bind({});
MultilineTextRequired.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/endNotes',
        options: {
            multi: true
        }
    }
}




export const RangeWithMinMax = Template.bind({});
RangeWithMinMax.args = {
    ...Default.args,
    // data: {
    //     age: 52
    // },
    uischema: {
        type: 'Control',
        scope: '#/properties/age',
        options: {
            type: 'range'
        }
    }
}

export const Select = Template.bind({});
Select.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/position'
    }
}