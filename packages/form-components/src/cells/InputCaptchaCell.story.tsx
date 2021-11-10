import React, { useCallback } from 'react';

import { Meta, Story } from '@storybook/react';
import { InputCaptchaCell } from './InputCaptchaCell';
import { CellProps } from '@jsonforms/core';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Cells/InputCaptchaCell',
    component: InputCaptchaCell,
} as Meta;

const Template: Story<CellProps> = (props) => {
    const [, updateArgs] = useArgs();
    const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
    const handleChange = (path: string, data: any) => {
        updateArgs({ data });
        logAction(path, data);
    };
    return <InputCaptchaCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    id: 'cell',
    data: '',
    schema: {
        type: 'string',
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
        },
    },
};
