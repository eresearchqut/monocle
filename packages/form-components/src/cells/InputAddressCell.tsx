import React, {useState, useEffect} from 'react';
import {CellProps, isStringControl, optionIs, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';
import {InputText} from 'primereact/inputtext';
import merge from 'lodash/merge';
import startCase from 'lodash/startCase';
import get from 'lodash/get';
import set from 'lodash/set';

import * as Nominatim from "nominatim-browser";
import {GeocodeRequest, GeocodeAddress, NominatimResponse} from "nominatim-browser";
import {Button} from "primereact/button";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";

export interface InputAddressCellOptions {
    required?: boolean;
    focus?: boolean;
}

export interface GeocodeAddressWithRoad extends GeocodeAddress {
    road: string
}

export interface Address {
    streetNumber?: string;
    street?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: string;
    longitude?: string;
    boundingBox?: string[]
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


    const {required} = merge({}, config, uischema?.options) as InputAddressCellOptions;
    const className = isValid ? undefined : 'p-invalid';

    const [address, setAddress] = useState<Address | undefined>(data as Address);
    const [verifiedAddresses, setVerifiedAddresses] = useState<Address[]>([]);

    useEffect(() => {
        handleChange(path, address);
    }, [address]);

    useEffect(() => {
        setAddress(data);
    }, [data]);

    if (!visible) {
        return null;
    }

    const verify = () => {
        const request: GeocodeRequest = {
            street: [address?.streetNumber, address?.street].filter((value) => value).join(' '),
            city: address?.city,
            state: address?.state,
            country: address?.country,
            county: address?.suburb,
            postalcode: address?.postalCode,
            addressdetails: true,
            limit: 10
        }

        Nominatim.geocode(request)
            .then((results: NominatimResponse[]) => setVerifiedAddresses(
                () => results.map(result => ({
                    streetNumber: result.address.house_number,
                    street: (result.address as GeocodeAddressWithRoad).road,
                    suburb: result.address.suburb,
                    city: result.address.city,
                    state: result.address.state,
                    country: result.address.country,
                    postalCode: result.address.postcode,
                    latitude: result.lat,
                    longitude: result.lon,
                    boundingBox: result.boundingbox
                }))
            ))
            .catch((error: any) => console.error(error));
    }


    const addressField = (fieldName: string, columnWidth: number) => {

        const fieldId = `${id}-${fieldName}`;
        const label = startCase(fieldName);

        return (
            <div className={`p-field p-md-${columnWidth}`}>
                <span className="p-float-label">

                    <InputText
                        value={get(address, fieldName)}
                        id={id}
                        className={className}
                        disabled={!enabled}
                        onChange={(e) =>
                            setAddress((currentAddress) =>
                                set(Object.assign({} as Address, currentAddress), fieldName, e.target.value))}
                        aria-required={required}
                    />
                    <label htmlFor={fieldId} aria-required={required}>{label}</label>
                </span>
            </div>
        )

    }


    return (
        <React.Fragment>
            <div className="p-fluid p-grid">
                {addressField('streetNumber', 2)}
                {addressField('street', 6)}
                {addressField('suburb', 4)}
                {addressField('city', 4)}
                {addressField('state', 4)}
                {addressField('country', 4)}
                {addressField('postalCode', 4)}

            </div>
            <Button label={'Verify Address'} onClick={() => verify()} disabled={!enabled}/>
            <DataTable value={verifiedAddresses} onRowSelect={e => handleChange(path, e.data)} selectionMode={'single'}>
                <Column field="streetNumber"></Column>
                <Column field="street"></Column>
                <Column field="suburb"></Column>
                <Column field="city"></Column>
                <Column field="state"></Column>
                <Column field="postalCode"></Column>
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
export const inputTextCellTester: RankedTester = rankWith(2, optionIs('type', 'address'));

export default withJsonFormsCellProps(InputAddressCell);