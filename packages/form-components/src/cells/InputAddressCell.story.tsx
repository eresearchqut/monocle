import React, { useCallback } from 'react';
import { Meta, Story } from '@storybook/react';
import { CellProps } from '@jsonforms/core';
import { InputAddressCell } from './InputAddressCell';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Cells/InputAddressCell',
    component: InputAddressCell,
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
    return <InputAddressCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: {
        street: 'Grove Street',
    },
    path: 'cell',
    schema: {
        type: 'string',
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
        options: {
            type: 'address',
        },
    },
};

export const CountryCodes = Template.bind({});
CountryCodes.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
        options: {
            type: 'address',
            countryCodes: ['AU', 'NZ'],
        },
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
