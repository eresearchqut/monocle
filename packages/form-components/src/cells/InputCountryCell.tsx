import React from 'react';
import { CellProps, optionIs, or, RankedTester, rankWith, scopeEndsWith } from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';

import merge from 'lodash/merge';
import { filterCountries } from '../utils/countryRegionUtils';

import { Dropdown, DropdownChangeParams } from 'primereact/dropdown';
import { MultiSelect, MultiSelectChangeParams } from 'primereact/multiselect';

export interface InputCountryCellOptions {
  required?: boolean;
  focus?: boolean;
  multiselect?: boolean;
  countryCodes?: string[];
}

export interface Country {
  name: string;
  shortCode: string;
}

export const InputCountryCell = (props: Partial<CellProps>) => {
  const { data, id, config, uischema, path, handleChange, visible = true, enabled = true, isValid = true } = props;

  const countryCellOptions = merge({}, config, uischema?.options) as InputCountryCellOptions;
  const { countryCodes, multiselect } = countryCellOptions;
  const isMultiSelect = multiselect || path?.endsWith('countryCodes');

  const className = isValid ? undefined : 'p-invalid';

  if (!visible) {
    return null;
  }

  const countryProps = {
    id,
    className,
    showClear: true,
    value: isMultiSelect && !Array.isArray(data) ? [] : data,
    disabled: !enabled,
    optionLabel: 'countryName',
    optionValue: 'countryShortCode',
    display: 'chip',
    options: filterCountries({ whitelist: countryCodes }),
    onChange: (e: DropdownChangeParams | MultiSelectChangeParams) => handleChange?.(path || '', e.value),
  };

  if (isMultiSelect) {
    return <MultiSelect {...countryProps} />;
  }

  return <Dropdown {...countryProps} />;
};

/**
 * Default tester for country controls.
 * @type
    {
        RankedTester
    }
 */
export const inputCountryCellTester: RankedTester = rankWith(
  3,
  or(optionIs('type', 'country'), scopeEndsWith('countryCodes'))
);

export default withJsonFormsCellProps(InputCountryCell);
