import React, {useCallback} from 'react';
import {Meta, Story} from '@storybook/react';
import {CellProps} from "@jsonforms/core";
import {InputMarkdownCell} from "./InputMarkdownCell";
import {useArgs} from "@storybook/client-api";
import {action} from "@storybook/addon-actions";

export default {
    title: 'Cells/InputMarkdownCell',
    component: InputMarkdownCell
} as Meta;

const Template: Story<CellProps> =
    (props) => {
        const [, updateArgs] = useArgs();
        const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
        const handleChange = (path: string, data: any) => {
            updateArgs({data});
            logAction(path, data);
        }
        return <InputMarkdownCell {...props} handleChange={handleChange}/>
    }
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: '',
    path: 'cell',
    schema: {
        type: 'string'
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
        options: {
            type: 'markdown'
        }
    }
}



export const Focus = Template.bind({});
Focus.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
        options: {
            focus: true
        }
    }
}









