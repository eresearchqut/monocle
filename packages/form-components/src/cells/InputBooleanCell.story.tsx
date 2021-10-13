import React, {useCallback} from 'react';

import {Meta, Story} from '@storybook/react';
import {InputBooleanCell} from "./InputBooleanCell";
import {CellProps} from "@jsonforms/core";
import {useArgs} from "@storybook/client-api";
import {action} from "@storybook/addon-actions";

export default {
    title: 'Cells/InputBooleanCell',
    component: InputBooleanCell,
    argTypes: {
        data: {
            options: [true, false, undefined],
            control: {type: 'radio'}
        },
        id: {table: {disable: true}}
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
        return <InputBooleanCell {...props} handleChange={handleChange}/>
    }
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: false,
    id: 'cell',
    schema: {
        type: 'boolean'
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell'
    }
}


export const Required = Template.bind({});
Required.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            required: true
        }
    }
}






