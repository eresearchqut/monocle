import React, { useCallback } from 'react';
import { Meta, Story } from '@storybook/react';
import { CellProps } from '@jsonforms/core';
import { InputTextCell } from './InputTextCell';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Cells/InputTextCell',
    component: InputTextCell,
    argTypes: {
        id: { table: { disable: true } },
    },
} as Meta;

const Template: Story<CellProps> = (props) => {
    const [, updateArgs] = useArgs();
    const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
    const handleChange = (path: string, data: any) => {
        updateArgs({ data });
        logAction(path, data);
    };
    return <InputTextCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: 'I am a text value',
    path: 'textCell',
    schema: {
        type: 'string',
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/textCell`,
    },
};

export const Invalid = Template.bind({});
Invalid.args = {
    ...Default.args,
    data: 'What went wrong',
    isValid: false,
};

export const Pattern = Template.bind({});
Pattern.args = {
    ...Default.args,
    data: 'No numbers please (I am set to accept no numeric characters only)',
    schema: {
        type: 'string',
        pattern: '^([^0-9]*)$',
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
