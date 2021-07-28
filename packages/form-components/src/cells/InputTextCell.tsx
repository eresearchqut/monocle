import React from 'react';
import {
    CellProps,
    isStringControl,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import merge from 'lodash/merge';


import {InputText} from 'primereact/inputtext';

export const InputTextCell = (props: CellProps) => {
    const {
        config,
        data,
        id,
        enabled,
        uischema,
        schema,
        path,
        handleChange
    } = props;
    const maxLength = schema.maxLength;
    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    return (
        <InputText
            value={data || ''}
            id={id}
            disabled={!enabled}
            onChange={(e) => handleChange(path, e.target.value)}
            autoFocus={uischema.options && uischema.options.focus}
            maxLength={appliedUiSchemaOptions.restrict ? maxLength : undefined}
        />
    );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputTextCellTester: RankedTester = rankWith(1, isStringControl);

export default withJsonFormsCellProps(InputTextCell);
