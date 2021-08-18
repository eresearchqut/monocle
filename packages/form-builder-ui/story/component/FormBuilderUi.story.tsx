import * as React from "react";

import {Story, Meta} from '@storybook/react';
import {FormBuilderUi, FormBuilderUiProps} from "../../src/component/FormBuilderUi";

export default {
    title: 'Component/FormBuilder',
    component: FormBuilderUi
} as Meta;



const Template: Story<FormBuilderUiProps > = (args) => <FormBuilderUi {...args} />;


export const FormWithNoSections = Template.bind({});
FormWithNoSections.args = {
    form: {
        name: 'Form With No Sections'
    }
};