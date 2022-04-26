import React, { useCallback } from 'react';
import { Meta, Story } from '@storybook/react';
import { EnumCellProps } from '@jsonforms/core';
import { InputSelectCell } from './InputSelectCell';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

export default {
    title: 'FormComponents/Cells/InputSelectCell',
    component: InputSelectCell,
} as Meta;

const Template: Story<EnumCellProps> = (props) => {
    const [, updateArgs] = useArgs();
    const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
    const handleChange = (path: string, data: any) => {
        updateArgs({ data });
        logAction(path, data);
    };
    return <InputSelectCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: 'Two',
    id: 'cell',
    path: 'cell',
    schema: {
        type: 'string',
        enum: ['One', 'Two', 'Three'],
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
    },
};

export const NotValid = Template.bind({});
NotValid.args = {
    ...Default.args,
    isValid: false,
};

export const NotVisible = Template.bind({});
NotVisible.args = {
    ...Default.args,
    visible: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
    ...Default.args,
    enabled: false,
};

export const OneOf = Template.bind({});
OneOf.args = {
    data: 2,
    id: 'cell',
    path: 'cell',
    schema: {
        type: 'number',
        oneOf: [
            { const: 1, title: 'Option A' },
            { const: 2, title: 'Option B' },
            { const: 3, title: 'Option C' },
        ],
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
    },
};
