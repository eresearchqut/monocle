import React, { useCallback } from 'react';
import { Meta, Story } from '@storybook/react';
import { EnumCellProps } from '@jsonforms/core';
import { InputRadioGroupCell } from './InputRadioGroupCell';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Cells/InputRadioGroupCell',
  component: InputRadioGroupCell,
} as Meta;

const Template: Story<EnumCellProps> = (props) => {
  const [, updateArgs] = useArgs();
  const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
  const handleChange = (path: string, data: any) => {
    updateArgs({ data });
    logAction(path, data);
  };
  return <InputRadioGroupCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
  data: 2,
  id: 'cell',
  path: 'cell',
  options: [
    { value: 1, label: 'One (1)' },
    { value: 2, label: 'Two (2)' },
    { value: 3, label: 'Three (3)' },
  ],
  schema: {
    type: 'string',
  },
  uischema: {
    type: 'Control',
    scope: `#/properties/cell`,
  },
};

export const NotValid = Template.bind({});
NotValid.args = {
  ...Default.args,
  isValid: false,
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
