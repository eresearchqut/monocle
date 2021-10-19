import React, {useCallback} from 'react';
import {Meta, Story} from '@storybook/react';
import {ControlProps, DispatchPropsOfMultiEnumControl, OwnPropsOfEnum} from "@jsonforms/core";
import {InputCheckboxGroupCell} from "./InputCheckboxGroupCell";
import {useArgs} from "@storybook/client-api";
import {action} from "@storybook/addon-actions";


export default {
    title: 'Cells/InputCheckboxGroupCell',
    component: InputCheckboxGroupCell
} as Meta;

const Template: Story<ControlProps & OwnPropsOfEnum & DispatchPropsOfMultiEnumControl> =
    (props) => {
        const [, updateArgs] = useArgs();
        const logAction = useCallback(action('handleChange'), []);
        const handleChange = (path: string, data: any) => {
            updateArgs({data});
            logAction(path, data);
        }
        return <InputCheckboxGroupCell {...props} handleChange={handleChange}/>
    }
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: [],
    id: 'cell',
    path: 'cell',
    options: [{value: 1, label: 'One (1)'}, {value: 2, label: 'Two (2)'}, {value: 3, label: 'Three (3)'}],
    schema: {
        type: 'string'
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`
    }
}

export const OneSelected = Template.bind({});
OneSelected.args = {
    ...Default.args,
    data: [2]
}


export const MultiSelected = Template.bind({});
MultiSelected.args = {
    ...Default.args,
    data: [2, 3]
}


export const NotVisible = Template.bind({});
NotVisible.args = {
    ...Default.args,
    visible: false
}

export const Disabled = Template.bind({});
Disabled.args = {
    ...Default.args,
    enabled: false
}

