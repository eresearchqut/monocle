import React from 'react';
import { CellProps, isStringControl, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { InputText } from 'primereact/inputtext';
import merge from 'lodash/merge';

export interface InputTextCellOptions {
  required?: boolean;
  focus?: boolean;
}

export const InputTextCell = (props: CellProps) => {
  const {
    data,
    id,
    schema,
    path,
    handleChange,
    config,
    uischema,
    visible = true,
    enabled = true,
    isValid = true,
  } = props;

  const { pattern } = schema;
  const keyFilter = pattern ? new RegExp(pattern) : undefined;
  const { required, focus } = merge({}, config, uischema?.options) as InputTextCellOptions;
  const className = isValid ? undefined : 'p-invalid';

  if (!visible) {
    return null;
  }

  return (
    <InputText
      value={data || ''}
      id={id}
      className={className}
      disabled={!enabled}
      onChange={(e) => handleChange(path, e.target.value)}
      keyfilter={keyFilter}
      aria-required={required}
      autoFocus={focus}
    />
  );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputTextCellTester: RankedTester = rankWith(1, isStringControl);

export default withJsonFormsCellProps(InputTextCell);
