import React from 'react';
import {
    CellProps,
    isStringControl,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';

import merge from 'lodash/merge';
import { Input } from 'rsuite';

export const InputCell = (props: CellProps ) => {
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
        <Input
            value={data || ''}
            id={id}
            disabled={!enabled}
            onChange={value => handleChange(path, value)}
            autoFocus={uischema.options && uischema.options.focus}
            maxLength={appliedUiSchemaOptions.restrict ? maxLength : undefined}
        />
    );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputCellTester: RankedTester = rankWith(1, isStringControl);

export default withJsonFormsCellProps(InputCell);
