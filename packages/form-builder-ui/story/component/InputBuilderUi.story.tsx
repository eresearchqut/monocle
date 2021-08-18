import * as React from "react";

import {Story, Meta} from '@storybook/react';
import {SectionBuilderUi, SectionBuilderUiProps} from "../../src/component/SectionBuilderUi";
import {InputBuilderUi, InputBuilderUiProps} from "../../src/component/InputBuilderUi";

export default {
    title: 'Component/InputBuilder',
    component: InputBuilderUi
} as Meta;

const Template: Story<InputBuilderUiProps> = (args) => <InputBuilderUi {...args} />;

export const TextInputBuilder = Template.bind({});
TextInputBuilder.args = {
    input: {
        inputType: 'text',
        name: 'Text Input',
        multiline: false
    }
};