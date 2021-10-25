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
import {DataTable, DataTableRowEditParams, DataTableEditingRows} from 'primereact/datatable';
import {Column, ColumnProps} from 'primereact/column';
import {InputText} from 'primereact/inputtext';
import {InputNumber} from 'primereact/inputnumber';
import {Button} from 'primereact/button'
import {v4 as uuidv4} from "uuid";
import {confirmDialog} from 'primereact/confirmdialog';

interface Option {
    id: string,
    label: string,
    value: string | number
}

interface RowProps extends ColumnProps {
    rowData: Option
    rowIndex: number
}

const OptionsLayout: FunctionComponent<ArrayControlProps> = ({
                                                                 path,
                                                                 data,
                                                             }) => {

    const [options, setOptions] = useState<Option[]>(data || []);
    const [editingOptions, setEditingOptions] = useState<DataTableEditingRows>({});
    const context = useJsonForms();
    const optionValueType = get(context.core?.data, path.replace('options', 'optionValueType')) || 'string';

    const updateOptions = (newOptions: Option[]) => context.dispatch && context.dispatch(update(path, () => newOptions))
    const onRowEditSave = () => updateOptions(options);

    const handleChange = (optionIndex: number, option: Option) => setOptions((currentOptions) => {
        const newOptions = [...currentOptions];
        newOptions[optionIndex] = option;
        return newOptions;
    });

    const onRowEditChange = (event: DataTableRowEditParams) => {
        setEditingOptions(event.data)
    };

    const onRowEditCancel = (event: DataTableRowEditParams) => {
        setOptions((currentOptions) => {
            const resetOptions = [...currentOptions];
            resetOptions[event.index] = data[event.index]
            return resetOptions;
        });
    };

    const addOption = () => {
        const newOption = {id: uuidv4(), label: '', value: ''} as Option
        setOptions((currentOptions) => [...currentOptions, newOption]);
        setEditingOptions((currentOptions) => ({...currentOptions, ...{[`${newOption.id}`]: true}}));
    };

    const deleteOption = (option: Option) => {
        setOptions((currentOptions) => [...currentOptions].filter((currentOption => currentOption.id !== option.id)));
        updateOptions(options);
    };

    const moveOption = (fromIndex: number, toIndex: number) => {
        setOptions((currentOptions) => {
            const newOptions = [...currentOptions];
            const element = newOptions[fromIndex];
            newOptions.splice(fromIndex, 1);
            newOptions.splice(toIndex, 0, element);
            return newOptions;
        });
        updateOptions(options);
    };

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


    const header = (
        <div className="p-d-flex">
            <label>Options</label>
            <Button icon="pi pi-plus" className="p-button-rounded p-button-text p-ml-auto" onClick={() => addOption()}/>
        </div>
    );

    const deleteActions = (option: Option) => {


        const confirm = () => {
            confirmDialog({
                message: `Are you sure you want to delete ${option.label}?`,
                header: 'Confirm Deletion',
                icon: 'pi pi-exclamation-triangle',
                accept: () => deleteOption(option),
            });
        }

        return (


            <Button icon="pi pi-fw pi-trash p-clickable" className="p-row-editor-init p-link"
                    onClick={confirm}/>


        )
    };

    const moveActions = (option: Option) => {

        const index = options.findIndex((found) => found.id === option.id);
        const canMoveUp = index != 0;
        const canMoveDown = index < options.length - 1;


        return (
            <React.Fragment>
                {canMoveDown &&
                <Button icon="pi pi-fw pi-angle-down p-clickable" className="p-row-editor-init p-link"
                        onClick={() => moveOption(index, index + 1)}/>
                }
                {canMoveUp &&
                <Button icon="pi pi-fw pi-angle-up p-clickable" className="p-row-editor-init p-link"
                        onClick={() => moveOption(index, index - 1)}/>
                }
            </React.Fragment>
        )
    };


    return (
        <DataTable dataKey='id' editMode='row' value={options} header={header} onRowEditSave={onRowEditSave}
                   onRowEditCancel={onRowEditCancel} editingRows={editingOptions}
                   onRowEditChange={onRowEditChange}>
            <Column field="label" header="Label" editor={(props) => labelEditor(props as RowProps)}/>
            <Column field="value" header="Value" editor={(props) => valueEditor(props as RowProps)}/>
            <Column rowEditor/>
            <Column body={moveActions}/>
            <Column body={deleteActions}/>

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