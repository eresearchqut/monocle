import React, { useCallback } from 'react';
import { Meta, Story } from '@storybook/react';
import { CellProps } from '@jsonforms/core';
import { InputMultiselectCell } from './InputMultiselectCell';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Cells/InputMultiselectCell',
  component: InputMultiselectCell,
} as Meta;

const Template: Story<CellProps> = (props) => {
  const [, updateArgs] = useArgs();
  const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
  const handleChange = (path: string, data: any) => {
    updateArgs({ data });
    logAction(path, data);
  };
  return <InputMultiselectCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
  data: [],
  id: 'cell',
  path: 'cell',
  schema: {
    type: 'array',
    items: {
      type: 'number',
      oneOf: [
        { const: 1, title: 'Option A' },
        { const: 2, title: 'Option B' },
        { const: 3, title: 'Option C' },
      ],
    },
  },
  uischema: {
    type: 'Control',
    scope: `#/properties/cell`,
  },
};

export const Invalid = Template.bind({});
Invalid.args = {
  ...Default.args,
  isValid: false,
};

export const OneSelected = Template.bind({});
OneSelected.args = {
  ...Default.args,
  data: [2],
};

export const MultiSelected = Template.bind({});
MultiSelected.args = {
  ...Default.args,
  data: [2, 3],
};

export const NotVisible = Template.bind({});
NotVisible.args = {
  ...Default.args,
  visible: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
  ...Default.args,
  enabled: false,
};
