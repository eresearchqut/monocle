import React, {useCallback} from 'react';

import {Meta, Story} from '@storybook/react';
import {InputDateCell} from "./InputDateCell";
import {CellProps} from "@jsonforms/core";
import {useArgs} from "@storybook/client-api";
import {action} from "@storybook/addon-actions";

export default {
    title: 'Cells/InputDateCell',
    component: InputDateCell,
    argTypes: {
        data: {
            control: {type: 'date'}
        }
    }
} as Meta;

const Template: Story<CellProps> =
    (props) => {
        const [, updateArgs] = useArgs();
        const logAction = useCallback(action('handleChange'), []);
        const handleChange = (path: string, data: any) => {
            updateArgs({data});
            logAction(path, data);
        }
        return <InputDateCell {...props} handleChange={handleChange}/>
    }
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: '2021-06-30',
    id: 'cell',
    config: {
        locale: 'en-AU'
    },
    schema: {
        type: 'string',
        format: 'date'
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell'
    }
}


export const Invalid = Template.bind({});
Invalid.args = {
    ...Default.args,
    isValid: false
}

export const Disabled = Template.bind({});
Disabled.args = {
    ...Default.args,
    enabled: false
}

export const NotVisible = Template.bind({});
NotVisible.args = {
    ...Default.args,
    visible: false
}

export const HideCalendarIcon = Template.bind({});
HideCalendarIcon.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            hideCalendarIcon: true
        }
    }
}





