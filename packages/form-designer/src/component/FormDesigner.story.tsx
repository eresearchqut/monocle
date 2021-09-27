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
    name: 'Muscular Atrophy',
    sections: [
      {
        name: 'Muscle Location',
        inputs: [
          {
            type: 'text',
            minLength: 100,
            maxLength: 200,
            name: 'Patient name',
            hint: 'First, Middle, :ast',
            required: true,
          },
          {
            type: 'date',
            required: true,
            name: 'Visit Date',
          },
          {
            type: 'text',
            name: 'Notes',
            hint: 'Clinician notes',
            multiline: true,
            required: false,
          },
          {
            type: 'currency',
            name: 'Pathology Charges',
            hint: 'Pathology charges associated with this visit',
            currencyCode: 'AUD',
            currencyDisplay: 'symbol',
            required: false,
          },
          {
            type: 'boolean',
            name: 'Weakness in more than one limb',
            hint: 'Is the patient experiencing marked weakness in one or more limb',
            required: false,
          },
          {
            type: 'boolean',
            required: true,
            name: 'Has there been degradation since last visit.',
          },
          {
            type: 'svg-map',
            multiselect: true,
            map: 'body',
            name: 'Muscles with marked weakness',
            hint: 'Multiple can be picked',
            required: false,
          },
        ],
      },
    ],
  },
};


