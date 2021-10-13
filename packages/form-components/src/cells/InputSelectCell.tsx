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
    const {data, id, enabled = true, visible = true, isValid = true, path, handleChange, options} = props;

    if (!visible) {
        return null;
    }

    const className = isValid ? undefined : 'p-invalid';

    return (
        <Dropdown
            id={id}
            value={data}
            optionLabel='label'
            optionValue='value'
            options={options}
            disabled={!enabled}
            className={className}
            onChange={(e) => handleChange(path, e.value)}/>
    );
};

export const inputSelectCellTester: RankedTester = rankWith(2, isEnumControl);

export default withJsonFormsEnumCellProps(InputSelectCell);
