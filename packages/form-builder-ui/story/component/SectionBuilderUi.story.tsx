import * as React from "react";

import {Story, Meta} from '@storybook/react';
import {SectionBuilderUi, SectionBuilderUiProps} from "../../src/component/SectionBuilderUi";

export default {
    title: 'Component/SectionBuilder',
    component: SectionBuilderUi
} as Meta;

const Template: Story<SectionBuilderUiProps > = (args) => <SectionBuilderUi {...args} />;

export const SectionWithNoInputs = Template.bind({});
SectionWithNoInputs.args = {
    section: {
        name: 'Section With No Inputs'
    }
};