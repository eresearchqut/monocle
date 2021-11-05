import React, {useState, useEffect} from 'react';
import {CellProps, optionIs, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import merge from 'lodash/merge';
import {filterCountries, FilterCountriesProps} from "../utils/countryRegionUtils";

import {Dropdown, DropdownChangeParams, DropdownProps} from "primereact/dropdown";

export interface InputCountryCellOptions extends FilterCountriesProps {
    required?: boolean;
    focus?: boolean;
    multiselect?: boolean;
}

export interface Country {
    name: string;
    shortCode: string;
}

export interface CountryDropdownProps extends FilterCountriesProps, DropdownProps {

}

export const CountryDropdown = (props: CountryDropdownProps) => {

    const counties: Country[] = filterCountries(props).map(countryRegion => ({name: countryRegion.countryName, shortCode: countryRegion.countryShortCode}));


    return      (
        <Dropdown {...props} options={counties} optionLabel='name' />
    );
}


export const InputCountryCell = (props: CellProps) => {
    const {
        data,
        id,
        config,
        uischema,
        path,
        handleChange,
        visible = true,
        enabled = true,
        isValid = true,
    } = props;


    const countryCellOptions = merge({}, config, uischema?.options) as InputCountryCellOptions;


    const className = isValid ? undefined : 'p-invalid';


    if (!visible) {
        return null;
    }

    const countryDropdownProps = {
        id,
        className,
        value: data,
        disabled: !enabled,
        onChange: (e: DropdownChangeParams) => handleChange(path, e.value),
        ...countryCellOptions
    }

    return <CountryDropdown {...countryDropdownProps} />
};

/**
 * Default tester for text-based/string controls.
 * @type
    {
        RankedTester
    }
 */
export const inputCountryCellTester: RankedTester = rankWith(2, optionIs('type', 'country'));

export default withJsonFormsCellProps(InputCountryCell);