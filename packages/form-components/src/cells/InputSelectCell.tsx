import React from 'react';
import {
    EnumCellProps,
    isEnumControl,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import {withJsonFormsEnumCellProps} from '@jsonforms/react';
import {Dropdown} from 'primereact/dropdown';

export const InputSelectCell = (props: EnumCellProps) => {
    const {data, id, enabled, path, handleChange, options} = props;
    return (
        <Dropdown id={id} disabled={!enabled} value={data} optionLabel="label" optionValue="value" options={options}
                  onChange={(e) => handleChange(path, e.value)}/>
    );
};

export const inputSelectCellTester: RankedTester = rankWith(2, isEnumControl);

export default withJsonFormsEnumCellProps(InputSelectCell);
