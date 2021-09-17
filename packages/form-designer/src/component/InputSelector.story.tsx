import * as React from 'react';

import {Meta, Story} from '@storybook/react';
import {InputSelector, InputSelectorProps} from './InputSelector';

export default {
  title: 'Component/InputSelector',
  component: InputSelector,
} as Meta;

const Template: Story<InputSelectorProps> =
    (props) =>
      <InputSelector {...props} />;
Template.bind({});

export const Example = Template.bind({});
Example.args = {
};


