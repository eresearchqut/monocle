import React from 'react';
import {CellProps, isStringControl, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import merge from 'lodash/merge';

import {InputText} from 'primereact/inputtext';





export interface InputTextCellOptions  {


}


export const InputTextCell = (props: CellProps) => {
    const {
        data,
        id,
        enabled,
        schema,
        path,
        handleChange,
        isValid
    } = props;
    const {pattern} = schema;
    const keyFilter = pattern ? new RegExp(pattern) : undefined;

    console.log(props);

    const className = isValid ? undefined : 'p-invalid';

    return (
        <InputText
            value={data || ''}
            id={id}
            className={className}
            disabled={!enabled}
            onChange={(e) => handleChange(path, e.target.value)}
            keyfilter={keyFilter}
        />
    );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputTextCellTester: RankedTester = rankWith(1, isStringControl);

export default withJsonFormsCellProps(InputTextCell);
