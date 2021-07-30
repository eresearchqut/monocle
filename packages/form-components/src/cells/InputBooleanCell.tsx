import React from 'react';
import {
    CellProps, isBooleanControl,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import {Checkbox} from 'primereact/checkbox';
import {TriStateCheckbox} from 'primereact/tristatecheckbox';
import merge from "lodash/merge";

export const InputBooleanCell = (props: CellProps) => {
    const {
        path,
        data,
        id,
        handleChange,
        config,
        uischema
    } = props;
    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    if (appliedUiSchemaOptions.input?.required) {
        return (
            <Checkbox id={id}
                onChange={(e) => handleChange(path, e.checked)} checked={data}></Checkbox>
        )
    }
    return (
        <TriStateCheckbox
            value={data}
            onChange={(e) => handleChange(path, e.value)}></TriStateCheckbox>
    );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputBooleanCellTester: RankedTester = rankWith(1, isBooleanControl);

export default withJsonFormsCellProps(InputBooleanCell);
