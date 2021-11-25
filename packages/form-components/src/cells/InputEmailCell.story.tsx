import React, { useCallback } from 'react';
import { Meta, Story } from '@storybook/react';
import { CellProps } from '@jsonforms/core';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';
import { InputEmailCell } from './InputEmailCell';

export default {
    title: 'Cells/InputEmailCell',
    component: InputEmailCell,
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
    return <InputEmailCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: 'a@b.c',
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
