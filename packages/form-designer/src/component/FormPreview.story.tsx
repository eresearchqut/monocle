import * as React from 'react';

import {Meta, Story} from '@storybook/react';
import {FormPreview, FormPreviewProps} from './FormPreview';

export default {
  title: 'Component/FormPreview',
  component: FormPreview,
} as Meta;

const Template: Story<FormPreviewProps> =
    (props) =>
      <FormPreview {...props} />;
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
        name: 'First Section',
        inputs: [
          {
            type: 'text',
            maxLength: 100,
            minLength: 200,
            name: 'Text Value',
            required: true,
          },
          {
            type: 'text',
            name: 'Multiline Text Value',
            multiline: true,
            required: false,
          },
          {
            type: 'currency',
            name: 'Currency',
            currencyCode: 'AUD',
            currencyDisplay: 'symbol',
            required: false,
          },
          {
            type: 'boolean',
            name: 'Unrequired Truthy',
            required: false,
          },
          {
            type: 'boolean',
            required: true,
            name: 'Required Truthy',
          },
          {
            type: 'date',
            required: true,
            name: 'Datum',
          },
        ],
      },
    ],
  },
};


