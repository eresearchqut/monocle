import React, {FunctionComponent, useState} from 'react';

import {
    ArrayControlProps,

    RankedTester,

    and, isObjectArrayWithNesting, scopeEndsWith, rankWith
} from '@jsonforms/core';
import {DispatchCell, withJsonFormsArrayControlProps} from '@jsonforms/react';


import {DataTable} from 'primereact/datatable';
import {Column, ColumnProps} from 'primereact/column';
import {InputText} from 'primereact/inputtext';
import {InputNumber} from 'primereact/inputnumber';


const OptionsLayout: FunctionComponent<ArrayControlProps> = ({
                                                                 addItem,
                                                                 uischema,
                                                                 schema,
                                                                 rootSchema,
                                                                 path,
                                                                 data,
                                                                 visible,
                                                                 errors,
                                                                 label,
                                                                 removeItems,
                                                                 childErrors
                                                             }) => {


    const [options, setOptions] = useState<[{ label: string, value: string | number }]>(data || []);


    return (
        <DataTable value={options} editMode="cell">
            <Column field="label" header="Code"/>
            <Column field="value" header="Value"/>
        </DataTable>
    )

}

export const isOptionsLayout = and(
    isObjectArrayWithNesting,
    scopeEndsWith('options')
);

export const optionsLayoutTester: RankedTester = rankWith(
    2,
    isOptionsLayout,
);

export default withJsonFormsArrayControlProps(OptionsLayout);