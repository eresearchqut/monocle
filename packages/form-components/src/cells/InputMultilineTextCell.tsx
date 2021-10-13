import React from 'react';
import {CellProps, isMultiLineControl, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import merge from 'lodash/merge';

import {InputTextarea} from "primereact/inputtextarea";

export interface InputMultilineTextCellOptions {
    required?: boolean;
    focus?: boolean;
}

export const InputMultilineTextCell = (props: CellProps) => {
    const {
        data,
        id,
        path,
        handleChange,
        config,
        uischema,
        visible = true,
        enabled = true,
        isValid = true,
    } = props;

    if (!visible) {
        return null;
    }

    const {required, focus} = merge({}, config, uischema?.options) as InputMultilineTextCellOptions;
    const className = isValid ? undefined : 'p-invalid';

    return (
        <InputTextarea
            value={data || ''}
            id={id}
            className={className}
            disabled={!enabled}
            onChange={(e) => handleChange(path, e.target.value)}
            autoFocus={focus}
            aria-required={required}
        />
    );

};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputMultilineTextCellTester: RankedTester = rankWith(2, isMultiLineControl);

export default withJsonFormsCellProps(InputMultilineTextCell);
