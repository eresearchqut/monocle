import * as React from 'react';

import {Meta, Story} from '@storybook/react';
import {FormDesigner, FormDesignerProps} from './FormDesigner';

export default {
  title: 'Component/FormDesigner',
  component: FormDesigner,
} as Meta;

const Template: Story<FormDesignerProps> =
    (props) =>
      <FormDesigner {...props} onDefinitionChange={({errors, data}) => console.log(errors, JSON.stringify(data))} />;
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
  definition: {
    name: 'Example Form',
    sections: [
      {
        name: 'The scene of the crime',
        inputs: [
          {
            type: 'text',
            minLength: 100,
            maxLength: 200,
            name: 'Your name',
            hint: 'This will be strictly confidential',
            required: true,
          },
          {
            type: 'date',
            required: true,
            name: 'When did the crime occur',
          },
          {
            type: 'text',
            name: 'The details',
            hint: 'Who, what, where etc...',
            multiline: true,
            required: false,
          },
          {
            type: 'currency',
            name: 'How much was stolen',
            currencyCode: 'AUD',
            currencyDisplay: 'symbol',
            required: false,
          },
          {
            type: 'boolean',
            name: 'Where you hurt?',
            required: false,
          },
          {
            type: 'boolean',
            required: true,
            name: 'Was anyone else hurt?',
          },
          {
            type: 'svg-map',
            multiselect: true,
            map: 'body',
            name: 'What did they hurt',
            hint: 'You can pick multiple',
            required: false,
          },
        ],
      },
    ],
  },
};


