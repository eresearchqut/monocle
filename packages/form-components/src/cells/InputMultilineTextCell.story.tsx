import React, { useCallback } from 'react';
import { Meta, Story } from '@storybook/react';
import { CellProps } from '@jsonforms/core';
import { InputMultilineTextCell } from './InputMultilineTextCell';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Cells/InputMultilineTextCell',
    component: InputMultilineTextCell,
} as Meta;

const Template: Story<CellProps> = (props) => {
    const [, updateArgs] = useArgs();
    const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
    const handleChange = (path: string, data: any) => {
        updateArgs({ data });
        logAction(path, data);
    };
    return <InputMultilineTextCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: 'I am a multiline text value\nA new line',
    path: 'cell',
    schema: {
        type: 'string',
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
    },
};

export const Invalid = Template.bind({});
Invalid.args = {
    ...Default.args,
    data: 'What went wrong\nGame over man.....',
    isValid: false,
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
