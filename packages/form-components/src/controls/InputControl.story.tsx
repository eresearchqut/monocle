import * as React from "react";

import {Meta, Story} from '@storybook/react';

import {ControlProps, JsonFormsCore, createAjv} from "@jsonforms/core";
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
        endNotes: '# One\n## two\n### three\n#### four\n* One\n* Two\n* Three\n* Four',
        lastName: '',
        position: 'Intergalactic Gambler',
        classification: 'A',
        classifications: ['B', 'C'],
        age: 52,
        notes: 'Will betray Han\n(at earliest convenience)',
        starDate: '2130-06-09',
        starDateTime: '2130-06-09T12:34:00.000Z',
        starTime: '12:34:00.000Z',
    },
    schema: {
        required: ['position', 'endNotes'],
        properties: {
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string',
                minLength: 3,
                description: 'Family or surname, should come after your first name'
            },
            position: {
                type: 'string',
                enum: ['Intergalactic Gambler', 'Bounty Hunter', 'Smuggler']
            },
            classification: {
                type: 'string',
                oneOf: [
                    { const: 'A', title: 'Option A' },
                    { const: 'B' },
                    { const: 'C', title: 'Option C' }
                ]
            },
            classifications: {
                type: 'array',
                items: {
                    type: 'string',
                    oneOf: [
                        { const: 'A', title: 'Option A' },
                        { const: 'B' },
                        { const: 'C', title: 'Option C' }
                    ]
                }
            },
            notes: {
                type: 'string'
            },
            endNotes: {
                type: 'string'
            },
            starDate: {
                type: 'string',
                format: 'date'
            },
            starDateTime: {
                type: 'string',
                format: 'date-time'
            },
            starTime: {
                type: 'string',
                format: 'time'
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

export const RadioGroup = Template.bind({});
RadioGroup.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/classification',
        options: {
            format: 'radio'
        }
    }
}

export const CheckboxGroup = Template.bind({});
CheckboxGroup.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/classifications',
        options: {
            format: 'checkbox'
        }
    }
}

export const Multiselect = Template.bind({});
Multiselect.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/classifications'
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

export const Markdown = Template.bind({});
Markdown.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/endNotes',
        options: {
            type: 'markdown'
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
            type: 'range',
            lowerLabel: 'Young',
            upperLabel: 'Old'
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

export const Date = Template.bind({});
Date.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/starDate'
    }
}

export const DateTime= Template.bind({});
DateTime.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/starDateTime'
    }
}

export const Time = Template.bind({});
Time.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/starTime'
    }
}