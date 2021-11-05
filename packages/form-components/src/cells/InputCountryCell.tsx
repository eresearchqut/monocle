import React, {useState, useEffect} from 'react';
import {CellProps, optionIs, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import merge from 'lodash/merge';
import {filterCountries} from "../utils/countryRegionUtils";

import {Dropdown, DropdownChangeParams} from "primereact/dropdown";
import {MultiSelect, MultiSelectChangeParams} from "primereact/multiselect";

export interface InputCountryCellOptions {
    required?: boolean;
    focus?: boolean;
    multiselect?: boolean;
    countryCodes: string[];
}

export interface Country {
    name: string;
    shortCode: string;
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
    const {countryCodes, multiselect} = countryCellOptions;

    const className = isValid ? undefined : 'p-invalid';

    if (!visible) {
        return null;
    }

    const countryProps = {
        id,
        className,
        whitelist: countryCodes,
        value: data,
        disabled: !enabled,
        optionLabel: 'name',
        display: 'chip',
        options: filterCountries({whitelist: countryCodes}).map(countryRegion => ({
            name: countryRegion.countryName,
            shortCode: countryRegion.countryShortCode
        })),
        onChange: (e: DropdownChangeParams | MultiSelectChangeParams) => handleChange(path, e.value)
    }


    if (multiselect) {
        return <MultiSelect {...countryProps} />
    }

    return <Dropdown {...countryProps} />
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