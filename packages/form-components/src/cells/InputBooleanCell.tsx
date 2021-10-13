import React from 'react';
import {CellProps, isBooleanControl, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import {Checkbox} from 'primereact/checkbox';
import {TriStateCheckbox} from 'primereact/tristatecheckbox';
import merge from "lodash/merge";


export interface InputBooleanCellOptions  {
    booleansAreTrueOrFalse?: boolean;
    required?: boolean;
}

export const InputBooleanCell = (props: CellProps) => {
    const {
        path,
        data,
        id,
        handleChange,
        config,
        uischema,
    } = props;

    const appliedUiSchemaOptions = merge({}, config, uischema?.options) as InputBooleanCellOptions;
    if (appliedUiSchemaOptions.required || appliedUiSchemaOptions.booleansAreTrueOrFalse) {
        return (
            <Checkbox inputId={id} id={id + '-input'} checked={!!data}
                      onChange={(e) => handleChange(path, e.checked)}></Checkbox>
        )
    }

    return (
        <TriStateCheckbox
            value={data}
            id={id + '-input'}
            inputId={id}
            onChange={(e) => handleChange(path, e.value)}></TriStateCheckbox>
    );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputBooleanCellTester: RankedTester = rankWith(1, isBooleanControl);

export default withJsonFormsCellProps(InputBooleanCell);
