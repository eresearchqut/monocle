import React from 'react';
import { CellProps, formatIs, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import { InputText } from 'primereact/inputtext';

import merge from 'lodash/merge';

export interface InputEmailCellOptions {
    required?: boolean;
    focus?: boolean;
}

const emailPattern = /[a-z0-9_\.\-\+@]/i;
export const InputEmailCell = (props: CellProps) => {
    const { data, id, path, handleChange, config, uischema, visible = true, enabled = true, isValid = true } = props;

    const { required, focus } = merge({}, config, uischema?.options) as InputEmailCellOptions;
    const className = isValid ? undefined : 'p-invalid';

    if (!visible) {
        return null;
    }

    return (
        <InputText
            value={data || ''}
            id={id}
            keyfilter={emailPattern}
            className={className}
            disabled={!enabled}
            onChange={(e) => handleChange(path, e.target.value)}
            aria-required={required}
            autoFocus={focus}
        />
    );
};

/**
 * Default tester for email controls.
 * @type {RankedTester}
 */
export const inputEmailCellTester: RankedTester = rankWith(1, formatIs('email'));

export default withJsonFormsCellProps(InputEmailCell);
