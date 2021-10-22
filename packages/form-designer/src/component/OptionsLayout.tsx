import React, {FunctionComponent, useState} from 'react';

import {
    ArrayControlProps,
    RankedTester,
    and,
    isObjectArrayWithNesting,
    scopeEndsWith,
    rankWith, update,
} from '@jsonforms/core';
import {withJsonFormsArrayControlProps, useJsonForms} from '@jsonforms/react';
import get from 'lodash/get';


import {DataTable} from 'primereact/datatable';
import {Column, ColumnProps} from 'primereact/column';
import {InputText} from 'primereact/inputtext';
import {InputNumber} from 'primereact/inputnumber';


interface Option {
    label: string,
    value: string | number
}


interface RowProps extends ColumnProps {
    rowData: Option
    rowIndex: number
}

const OptionsLayout: FunctionComponent<ArrayControlProps> = ({
                                                                 addItem,
                                                                 removeItems,
                                                                 path,
                                                                 data,
                                                                 visible,

                                                             }) => {


    const [options, setOptions] = useState<Option[]>(data || []);
    const context = useJsonForms();
    const optionValueType = get(context.core?.data, path.replace('options', 'optionValueType')) || 'string';


    const updateOptions = (newOptions: Option[]) => context.dispatch && context.dispatch(update(path, () => newOptions))
    const onRowEditSave = () => updateOptions(options);


    const handleChange = (optionIndex: number, option: Option) => setOptions((currentOptions) => {
        const newOptions = [...currentOptions];
        newOptions[optionIndex] = option;
        return newOptions;
    });


    const labelEditor = (props: RowProps) => <InputText value={props.rowData.label}
                                                        onChange={(e) =>
                                                            handleChange(props.rowIndex, {
                                                                ...props.rowData,
                                                                label: e.target.value
                                                            })}/>

    const valueEditor = (props: RowProps) => optionValueType === 'string' ?
        <InputText value={props.rowData.value}
                   onChange={(e) =>
                   handleChange(props.rowIndex, {
                       ...props.rowData,
                       value: e.target.value
                   })}/> :
        <InputNumber value={props.rowData.value as number} useGrouping={false}
                   onChange={(e) =>
                       handleChange(props.rowIndex, {
                           ...props.rowData,
                           value: e.value
                       })}/>


    return (
        <DataTable value={options} header={'Options'} editMode='row' onRowEditSave={onRowEditSave}
                   onRowEditCancel={() => setOptions(() => data)}>
            <Column field="label" header="Label" editor={(props) => labelEditor(props as RowProps)}/>
            <Column field="value" header="Value" editor={(props) => valueEditor(props as RowProps)}/>
            <Column rowEditor/>
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