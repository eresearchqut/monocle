import React, { useCallback } from 'react';

import { InputRangeCell } from './InputRangeCell';

import { CellProps } from '@jsonforms/core';
import { Meta, Story } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { useArgs } from '@storybook/client-api';

export default {
    title: 'FormComponents/Cells/InputRangeCell',
    component: InputRangeCell,
} as Meta;

const Template: Story<CellProps> = (props) => {
    const [, updateArgs] = useArgs();
    const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
    const handleChange = (path: string, data: any) => {
        updateArgs({ data });
        logAction(path, data);
    };
    return <InputRangeCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: 5,
    id: 'cell',
    schema: {
        type: 'number',
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
    },
};

export const Disabled = Template.bind({});
Disabled.args = {
    ...Default.args,
    enabled: false,
};

export const NotVisible = Template.bind({});
NotVisible.args = {
    ...Default.args,
    visible: false,
};

export const Minimum = Template.bind({});
Minimum.args = {
    ...Default.args,
    data: 22,
    schema: {
        type: 'number',
        minimum: 20,
    },
};

export const Maximum = Template.bind({});
Maximum.args = {
    ...Default.args,
    data: 88,
    schema: {
        type: 'number',
        maximum: 90,
    },
};

export const MinimumMaximum = Template.bind({});
MinimumMaximum.args = {
    ...Default.args,
    data: 45,
    schema: {
        type: 'number',
        minimum: 40,
        maximum: 50,
    },
};

export const MultipleOf = Template.bind({});
MultipleOf.args = {
    ...Default.args,
    data: 5.5,
    schema: {
        type: 'number',
        multipleOf: 0.5,
    },
};

export const Focus = Template.bind({});
Focus.args = {
    ...Default.args,
    data: 45,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            focus: true,
        },
    },
};

export const Labels = Template.bind({});
Labels.args = {
    ...Default.args,
    data: 3,
    schema: {
        type: 'number',
        minimum: 1,
        maximum: 5,
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            lowerLabel: 'Bad',
            upperLabel: 'Good',
        },
    },
};
