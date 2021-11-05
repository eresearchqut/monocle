import React, {useState, useEffect} from 'react';
import {CellProps, composePaths, optionIs, RankedTester, rankWith, UISchemaElement} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';
import {InputText} from 'primereact/inputtext';
import merge from 'lodash/merge';
import startCase from 'lodash/startCase';
import get from 'lodash/get';
import set from 'lodash/set';


import {geocode, GeocodeRequest, NominatimResponse} from "../client/nominatimClient";
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {Country, InputCountryCell} from "./InputCountryCell";
import {Dropdown, DropdownChangeParams} from "primereact/dropdown";
import {filterCountries} from "../utils/countryRegionUtils";
import {MultiSelectChangeParams} from "primereact/multiselect";

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
        schema,
        uischema,
        path,
        handleChange,
        visible = true,
        enabled = true,
        isValid = true,

    } = props;


    const {required, focus, countryCodes} = merge({}, config, uischema?.options) as InputAddressCellOptions;


    const className = isValid ? undefined : 'p-invalid';
    const [searchResults, setSearchResults] = useState<Address[]>([]);

    if (!visible) {
        return null;
    }

    const search = () => {

        const address = data as Address;

        const request: GeocodeRequest =
            {
                street: [address?.streetNumber, address?.street].filter((value) => value)?.join(' '),
                city: address?.city,
                state: address?.state,
                country: address?.country?.name,
                county: address?.suburb,
                postalcode: address?.postalCode,
                countrycodes: countryCodes?.map((countryCode) => countryCode.toLowerCase()),
                addressdetails: true,
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


    const addressField = (fieldName: string, columnWidth: number) => {

        const fieldId = `${id}-${fieldName}`;
        const label = startCase(fieldName);




        return (
            <div className={`p-field p-col-12 p-sm-${columnWidth}`}>
                <span className="p-float-label">
                    {fieldName === 'country' &&
                        <Dropdown
                            id={id}
                            optionLabel={'name'}
                            value={get(data as Address, fieldName)}
                            options={filterCountries({whitelist: countryCodes}).map(countryRegion => ({name: countryRegion.countryName, shortCode: countryRegion.countryShortCode}))}
                            onChange={(e) => handleChange(path, set(Object.assign({} as Address, data), fieldName, e.target.value))}
                        />
                    }
                    {fieldName !== 'country' &&
                    <InputText
                        value={get(data as Address, fieldName)}
                        id={id}
                        className={className}
                        disabled={!enabled}
                        onChange={(e) =>
                        handleChange(path, set(Object.assign({} as Address, data), fieldName, e.target.value))} />
                    }
                    <label htmlFor={fieldId} aria-required={required}>{label}</label>
                </span>
            </div>
        )

    }


    return (
        <React.Fragment>
            <div className="p-fluid p-grid p-mt-3">
                {addressField('streetNumber', 2)}
                {addressField('street', 6)}
                {addressField('suburb', 4)}
                {addressField('city', 3)}
                {addressField('state', 3)}
                {addressField('country', 4)}
                {addressField('postalCode', 2)}
            </div>
            <Button label={'Search'} onClick={search} disabled={!enabled}/>
            <DataTable value={searchResults} onRowSelect={e => handleChange(path, e.data)} selectionMode={'single'}>
                <Column field="displayName"></Column>

            </DataTable>
        </React.Fragment>

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