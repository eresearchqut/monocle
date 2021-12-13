import * as React from 'react';
import { useCallback, useEffect } from 'react';

import { Meta, Story } from '@storybook/react';

import { ControlProps, createAjv, JsonFormsCore } from '@jsonforms/core';
import { JsonFormsReactProps, JsonFormsStateProvider, useJsonForms } from '@jsonforms/react';
import SvgMapControl from './SvgMapControl';

import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';
import { cells } from '../index';

const ChangeEmitter: React.FC<JsonFormsReactProps> = ({ onChange }) => {
    const ctx = useJsonForms();
    const { data, errors } = ctx.core as JsonFormsCore;
    useEffect(() => {
        if (onChange) {
            onChange({ data, errors });
        }
    }, [data, errors]); // eslint-disable-line react-hooks/exhaustive-deps
    return null;
};

export default {
    title: 'Controls/SvgMapControl',
    component: SvgMapControl,
    decorators: [
        (Story, context) => {
            const { schema, uischema, data } = context.args as ControlProps;
            const core = { schema, uischema, data, ajv: createAjv() };
            const [, updateArgs] = useArgs();
            const logAction = useCallback(action('onChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
            return (
                <JsonFormsStateProvider initState={{ core, cells }}>
                    <ChangeEmitter
                        onChange={({ data }) => {
                            updateArgs({ data });
                            logAction(data);
                        }}
                    />
                    <Story />
                </JsonFormsStateProvider>
            );
        },
    ],
} as Meta;

const Template: Story<ControlProps> = (props) => <SvgMapControl {...props} id="static" />;
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: {
        singleSelect: undefined,
        multiSelect: [],
    },
    schema: {
        properties: {
            singleSelect: {
                type: 'object',
                properties: {
                    value: {
                        type: 'string',
                    },
                    label: {
                        type: 'string',
                    },
                },
            },
            multiSelect: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        value: {
                            type: 'string',
                        },
                        label: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/singleSelect',
    },
    cells,
};

export const SingleSelect = Template.bind({});
SingleSelect.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/singleSelect',
        options: {
            map: 'PainScaleV1',
        },
    },
};

export const MultiSelect = Template.bind({});
MultiSelect.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/multiSelect',
        options: {
            map: 'MuscleGroupsV1',
            multiselect: true,
        },
    },
};
