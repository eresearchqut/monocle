import React, { FunctionComponent, useRef, useState } from 'react';

import {
    and,
    ArrayControlProps,
    isObjectArrayWithNesting,
    RankedTester,
    rankWith,
    scopeEndsWith,
    update,
} from '@jsonforms/core';
import { useJsonForms, withJsonFormsArrayControlProps } from '@jsonforms/react';
import get from 'lodash/get';
import {
    DataTable,
    DataTableEditingRows,
    DataTableRowEditParams,
    DataTableRowEditSaveParams,
} from 'primereact/datatable';
import { Column, ColumnProps } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Messages } from 'primereact/messages';
import { Button } from 'primereact/button';
import { v4 as uuidv4 } from 'uuid';
import { confirmDialog } from 'primereact/confirmdialog';

interface Option {
    id: string;
    label: string;
    value?: any;
}

interface RowProps extends ColumnProps {
    rowData: Option;
    rowIndex: number;
}

const OptionsLayout: FunctionComponent<ArrayControlProps> = ({ path, data }) => {
    const value: Option[] = data;

    const [editingRows, setEditingRows] = useState<DataTableEditingRows>({});
    const [edits, setEdits] = useState<{ [key: string]: Option }>({});
    const messages = useRef<Messages>(null);

    const context = useJsonForms();
    const optionValueType = get(context.core?.data, path.replace('options', 'optionValueType')) || 'string';

    const updateOptions = (options: Option[]) => context.dispatch && context.dispatch(update(path, () => options));

    const addOption = () => {
        const newOption = { id: uuidv4(), label: '', value: '' } as Option;
        value.push(newOption);
        setEdits((currentEdits) => {
            const newEdits = { ...currentEdits };
            newEdits[newOption.id] = newOption;
            return newEdits;
        });
        setEditingRows((currentOptions) => ({ ...currentOptions, ...{ [`${newOption.id}`]: true } }));
    };

    const moveOption = (fromIndex: number, toIndex: number) => {
        const options = [...value];
        const element = options[fromIndex];
        options.splice(fromIndex, 1);
        options.splice(toIndex, 0, element);
        updateOptions(options);
    };

    const moveActions = (option: Option) => {
        const index = value.findIndex((found) => found.id === option.id);
        const canMoveUp = index != 0;
        const canMoveDown = index < value.length - 1;

        return (
            <React.Fragment>
                {canMoveDown && (
                    <Button
                        icon="pi pi-fw pi-angle-down p-clickable"
                        className="p-row-editor-init p-link"
                        onClick={() => moveOption(index, index + 1)}
                    />
                )}
                {canMoveUp && (
                    <Button
                        icon="pi pi-fw pi-angle-up p-clickable"
                        className="p-row-editor-init p-link"
                        onClick={() => moveOption(index, index - 1)}
                    />
                )}
            </React.Fragment>
        );
    };

    const onRowEditInit = (event: DataTableRowEditParams) =>
        setEdits((currentEdits) => ({
            ...currentEdits,
            [event.data.id]: { ...event.data },
        }));

    const onRowEditCancel = (event: DataTableRowEditParams) => {
        setEdits((currentEdits) => {
            const newEdits = { ...currentEdits };
            delete newEdits[event.data.id];
            return newEdits;
        });
        messages?.current?.clear();
    };

    const onRowEditChange = (event: DataTableRowEditParams) => {
        setEditingRows(event.data);
    };

    const onRowEditSave = (event: DataTableRowEditSaveParams) => {
        if (event.valid) {
            const options = [...value];
            options[event.index] = edits[event.data.id];
            updateOptions(options);
            onRowEditCancel(event);
            messages?.current?.clear();
        }
    };

    const editLabel = (id: string, value: string) => {
        setEdits((currentEdits) => {
            const newEdits = { ...currentEdits };
            newEdits[id].label = value;
            return newEdits;
        });
    };

    const editValue = (id: string, value?: any) => {
        setEdits((currentEdits) => {
            const newEdits = { ...currentEdits };
            newEdits[id].value = value;
            return newEdits;
        });
    };

    const rowEditorValidator = (data: Option) => {
        const edited = edits[data.id];
        const nonUnique = value.find((option) => {
            if (edited.id !== option.id && (edited.label === option.label || edited.value === option.value)) {
                return true;
            }
            return false;
        });
        if (messages?.current && nonUnique) {
            messages.current.show([
                {
                    severity: 'error',
                    summary: 'Option labels and values must be unique',
                    sticky: true,
                },
            ]);
            return false;
        }
        return true;
    };

    const labelEditor = (props: RowProps) => (
        <InputText
            value={edits[props.rowData.id].label}
            onChange={(e) => editLabel(props.rowData.id, e.target.value)}
        />
    );

    const valueEditor = (props: RowProps) =>
        optionValueType === 'string' ? (
            <InputText
                value={edits[props.rowData.id].value}
                onChange={(e) => editValue(props.rowData.id, e.target.value)}
            />
        ) : (
            <InputNumber
                value={edits[props.rowData.id].value as number}
                onChange={(e) => editValue(props.rowData.id, e.value)}
                useGrouping={false}
            />
        );

    const deleteOption = (optionToDelete: Option) => {
        updateOptions(value.filter((option) => option.id != optionToDelete.id));
    };

    const deleteActions = (option: Option) => {
        const confirm = () => {
            confirmDialog({
                message: `Are you sure you want to delete ${option.label}?`,
                header: 'Confirm Deletion',
                icon: 'pi pi-exclamation-triangle',
                accept: () => deleteOption(option),
            });
        };
        return <Button icon="pi pi-fw pi-trash p-clickable" className="p-row-editor-init p-link" onClick={confirm} />;
    };

    const header = (
        <div className="p-d-flex p-ai-center">
            <label>Options</label>
            <Button
                icon="pi pi-plus"
                className="p-button-rounded p-button-text p-ml-auto"
                onClick={() => addOption()}
                aria-label="Add Option"
                tooltip="Add Option"
            />
        </div>
    );

    return (
        <React.Fragment>
            <Messages ref={messages} />
            <DataTable
                dataKey="id"
                editMode="row"
                value={value}
                header={header}
                editingRows={editingRows}
                onRowEditInit={onRowEditInit}
                onRowEditCancel={onRowEditCancel}
                onRowEditChange={onRowEditChange}
                onRowEditSave={onRowEditSave}
                rowEditValidator={rowEditorValidator}
            >
                <Column field="label" header="Label" editor={(props) => labelEditor(props as RowProps)} />
                <Column field="value" header="Value" editor={(props) => valueEditor(props as RowProps)} />
                <Column rowEditor header="Edit" />
                <Column body={moveActions} header="Move" />
                <Column body={deleteActions} header="Delete" />
            </DataTable>
        </React.Fragment>
    );
};

export const isOptionsLayout = and(isObjectArrayWithNesting, scopeEndsWith('options'));

export const optionsLayoutTester: RankedTester = rankWith(2, isOptionsLayout);

export default withJsonFormsArrayControlProps(OptionsLayout);
