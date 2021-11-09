import * as React from 'react';

import { Meta, Story } from '@storybook/react';
import { FormPreview, FormPreviewProps } from './FormPreview';

export default {
    title: 'Component/FormPreview',
    component: FormPreview,
} as Meta;

const Template: Story<FormPreviewProps> = (props) => <FormPreview {...props} />;
Template.bind({});

export const Example = Template.bind({});
Example.args = {
    data: {
        firstSection: {
            textValue: 'I am some text',
            currency: 99.99,
            requiredTruthy: true,
        },
    },
    definition: require('./definition.story.json'),
    locale: 'en-AU',
};
