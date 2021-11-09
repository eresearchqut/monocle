import React from 'react';
import { CellProps, optionIs, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';

import { InputNumber } from 'primereact/inputnumber';
import merge from 'lodash/merge';

export interface InputCurrencyCellOptions {
  step?: number;
  groupNumbers?: boolean;
  decimalPlaces?: number;
  focus?: boolean;
  currencyCode?: string;
  currencyDisplay?: 'code' | 'symbol';
}

export const InputCurrencyCell = (props: CellProps) => {
  const {
    config,
    data,
    id,
    uischema,
    schema,
    path,
    handleChange,
    visible = true,
    isValid = true,
    enabled = true,
  } = props;

  if (!visible) {
    return null;
  }

  const { minimum, maximum } = schema;
  const { groupNumbers, step, decimalPlaces, focus, currencyCode, currencyDisplay } = merge(
    {},
    config,
    uischema.options
  ) as InputCurrencyCellOptions;

  const minFractionDigits = decimalPlaces ? 1 : undefined;
  const maxFractionDigits = decimalPlaces;

  const className = isValid ? undefined : 'p-invalid';

  return (
    <InputNumber
      value={data}
      mode={'currency'}
      currency={currencyCode}
      currencyDisplay={currencyDisplay}
      id={id}
      min={minimum}
      max={maximum}
      step={step}
      useGrouping={!!groupNumbers}
      minFractionDigits={minFractionDigits}
      maxFractionDigits={maxFractionDigits}
      disabled={!enabled}
      className={className}
      onChange={(e) => handleChange(path, e.value)}
      autoFocus={focus}
    />
  );
};

/**
 * Default tester for numeric cells.
 * @type {RankedTester}
 */
export const inputNumberCellTester: RankedTester = rankWith(2, optionIs('type', 'currency'));

export default withJsonFormsCellProps(InputCurrencyCell);
