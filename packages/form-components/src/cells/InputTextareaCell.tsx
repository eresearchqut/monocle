import React from 'react';
import {
    CellProps,
    isMultiLineControl,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import merge from 'lodash/merge';

import {InputTextarea} from 'primereact/inputtextarea';

export const InputTextareaCell = (props: CellProps) => {
    const {
        config,
        data,
        id,
        errors,
        enabled,
        uischema,
        schema,
        path,
        handleChange
    } = props;
    const maxLength = schema.maxLength;
    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const className = errors.length === 0 ? undefined : 'p-invalid';
    return (
        <InputTextarea
            value={data || ''}
            id={id}
            className={className}
            disabled={!enabled}
            onChange={(e) => handleChange(path, e.target.value)}
            autoFocus={uischema.options && uischema.options.focus}
            maxLength={appliedUiSchemaOptions.restrict ? maxLength : undefined}
        />
    );
};

/**
 * Default tester for multiline text-based/string controls.
 * @type {RankedTester}
 */
export const inputTextareaCellTester: RankedTester = rankWith(2, isMultiLineControl);

export default withJsonFormsCellProps(InputTextareaCell);
