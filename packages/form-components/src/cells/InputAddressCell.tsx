import React, {useState} from 'react';
import {CellProps, optionIs, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';
import merge from 'lodash/merge';
import startCase from 'lodash/startCase';
import get from 'lodash/get';
import set from 'lodash/set';


import {geocode, GeocodeRequest, NominatimResponse} from "../client/nominatimClient";

import {Country} from "./InputCountryCell";
import {Dropdown} from "primereact/dropdown";
import {filterCountries} from "../utils/countryRegionUtils";
import {AutoComplete, AutoCompleteCompleteMethodParams} from "primereact/autocomplete";
import { Fieldset } from 'primereact/fieldset';

export interface InputAddressCellOptions {
    required?: boolean;
    focus?: boolean;
    countryCodes: Array<string>
}

export interface Address {
    streetNumber?: string;
    street?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: Country;
    postalCode?: string;
}

export const InputAddressCell = (props: CellProps) => {
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


    const {required, countryCodes, focus} = merge({}, config, uischema?.options) as InputAddressCellOptions;

    const className = isValid ? undefined : 'p-invalid';
    const [searchResults, setSearchResults] = useState<Address[]>([]);

    if (!visible) {
        return null;
    }

    const search = (e: AutoCompleteCompleteMethodParams) => {

        const request: GeocodeRequest =
            {
                q: e.query,
                addressdetails: true,
                countrycodes: countryCodes?.map((countryCode) => countryCode.toLowerCase()),
                limit: 50
            }

        geocode(request)
            .then((results: NominatimResponse[]) => setSearchResults(
                () => results.map(result => ({
                    displayName: result.display_name,
                    streetNumber: result.address.house_number,
                    street: result.address.road,
                    suburb: result.address.suburb,
                    city: result.address.city,
                    state: result.address.state,
                    country: {name: result.address.country, shortCode: result.address.country_code.toUpperCase()},
                    postalCode: result.address.postcode
                }))
            ))
            .catch((error: any) => console.error(error));
    }


    const addressField = (fieldName: string) => {

        const fieldId = `${id}-${fieldName}`;
        const label = startCase(fieldName);

        return (
            <div className={`p-field`}>
                <label htmlFor={fieldId} aria-required={required}>{label}</label>
                {fieldName === 'country' &&
                <Dropdown
                    id={id}
                    showClear={true}
                    disabled={!enabled}
                    optionLabel={'name'}
                    className={className}
                    value={get(data as Address, fieldName)}
                    options={filterCountries({whitelist: countryCodes}).map(countryRegion => ({
                        name: countryRegion.countryName,
                        shortCode: countryRegion.countryShortCode
                    }))}
                    onChange={(e) => handleChange(path, set(Object.assign({} as Address, data), fieldName, e.target.value))}
                />
                }
                {fieldName !== 'country' &&
                <AutoComplete
                    appendTo={"self"}
                    autoFocus={ focus && fieldName === 'streetNumber'}
                    delay={800}
                    completeMethod={search}
                    suggestions={searchResults}
                    value={get(data as Address, fieldName)}
                    id={id}
                    className={className}
                    disabled={!enabled}
                    field={'displayName'}
                    onSelect={(e) => handleChange(path, e.value)}
                    onChange={(e) =>
                        handleChange(path, set(Object.assign({} as Address, data), fieldName, e.target.value))}/>
                }
            </div>
        )
    }

    return (

        <Fieldset className={`p-fluid`}>
            {addressField('streetNumber')}
            {addressField('street')}
            {addressField('suburb')}
            {addressField('city')}
            {addressField('state')}
            {addressField('country')}
            {addressField('postalCode')}
        </Fieldset>


    );
};

/**
 * Default tester for text-based/string controls.
 * @type
    {
        RankedTester
    }
 */
export const inputAddressCellTester: RankedTester = rankWith(2, optionIs('type', 'address'));

export default withJsonFormsCellProps(InputAddressCell);