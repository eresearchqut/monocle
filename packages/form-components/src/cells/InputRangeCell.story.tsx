import React, {useCallback} from 'react';

import {InputRangeCell} from "./InputRangeCell";

import {CellProps} from "@jsonforms/core";
import {Meta, Story} from "@storybook/react";
import {action} from '@storybook/addon-actions';
import {useArgs} from '@storybook/client-api';


export default {
    title: 'Cells/InputRangeCell',
    component: InputRangeCell
} as Meta;

const Template: Story<CellProps> =
    (props) => {
        const [, updateArgs] = useArgs();
        const logAction = useCallback(action('handleChange'), []);
        const handleChange = (path: string, data: any) => {
            updateArgs({data});
            logAction(path, data);
        }
        return <InputRangeCell {...props} handleChange={handleChange}/>
    }
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: 5,
    id: 'cell',
    schema: {
        type: 'number'
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell'
    }
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

export const Minimum = Template.bind({});
Minimum.args = {
    ...Default.args,
    data: 22,
    schema: {
        type: 'number',
        minimum: 20
    },
}

export const Maximum = Template.bind({});
Maximum.args = {
    ...Default.args,
    data: 88,
    schema: {
        type: 'number',
        maximum: 90
    },
}

export const MinimumMaximum = Template.bind({});
MinimumMaximum.args = {
    ...Default.args,
    data: 45,
    schema: {
        type: 'number',
        minimum: 40,
        maximum: 50
    },
}

export const VerticalOrientation = Template.bind({});
VerticalOrientation.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            orientation: 'vertical'
        }
    }
}

export const Step = Template.bind({});
Step.args = {
    ...Default.args,
    data: 5.5,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            step: 0.5
        }
    }
}

export const Range = Template.bind({});
Range.args = {
    ...Default.args,
    data: [10, 20],
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            range: true
        }
    }
}