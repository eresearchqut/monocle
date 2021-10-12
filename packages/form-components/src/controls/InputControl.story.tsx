import * as React from "react";

import {Meta, Story} from '@storybook/react';

import {ControlProps, createAjv} from "@jsonforms/core";
import {JsonFormsStateProvider} from '@jsonforms/react';
import InputControl from "./InputControl";

import {renderers, cells} from "../index";
import {Default} from "../cells/InputTextCell.story";

export default {
    title: 'Controls/InputControl',
    component: InputControl,
    args: {
        cells,
        renderers
    },
    argTypes: {
        data: {
            table: {
                disable: true
            }
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
        },
        renderers: {
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
                <JsonFormsStateProvider initState={{core, cells, renderers}}>
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

export const Text = Template.bind({});
Text.args = {
    schema: {
        required: ['lastName', 'endNotes'],
        properties: {
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string'
            },
            notes: {
                type: 'string'
            },
            endNotes: {
                type: 'string'
            }
        }
    },
    data: {
        firstName: 'Lando',
        notes: 'Will betray Han\n(at earliest convenience)',
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/firstName'
    }
}

export const TextRequired = Template.bind({});
TextRequired.args = {
    ...Text.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/lastName',
        options: {
            required: true
        }
    }
}

export const TextDescription = Template.bind({});
TextDescription.args = {
    ...Text.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/lastName',
        options: {
            description: 'Family or surname, should come after your first name'
        }
    }
}

export const TextMultiline = Template.bind({});
TextMultiline.args = {
    ...Text.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/notes',
        options: {
            multiline: true
        }
    }
}

export const TextMultilineRequired = Template.bind({});
TextMultilineRequired.args = {
    ...Text.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/endNotes',
        options: {
            multiline: true,
            required: true
        }
    }
}

