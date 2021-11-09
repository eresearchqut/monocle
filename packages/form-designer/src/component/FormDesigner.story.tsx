import * as React from 'react';

import { Meta, Story } from '@storybook/react';
import { FormDesigner, FormDesignerProps } from './FormDesigner';

export default {
  title: 'Component/FormDesigner',
  component: FormDesigner,
} as Meta;

const Template: Story<FormDesignerProps> = (props) => <FormDesigner {...props} />;
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
