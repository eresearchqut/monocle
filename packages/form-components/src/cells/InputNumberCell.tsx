import React from 'react';
import {CellProps, isIntegerControl, isNumberControl, or, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import {InputNumber} from 'primereact/inputnumber';
import merge from "lodash/merge";

export interface InputNumberCellOptions {
    step?: number,
    groupNumbers?: boolean
    decimalPlaces?: number,
    focus?: boolean
}

export const InputNumberCell = (props: CellProps) => {
    const {
        config,
        data,
        id,
        uischema,
        schema,
        path,
        handleChange,
        visible = true,
        isValid = true,
        enabled = true
    } = props;

    if (!visible) {
        return null;
    }

    const {minimum, maximum} = schema;
    const {groupNumbers, step, decimalPlaces, focus} = merge({}, config, uischema.options) as InputNumberCellOptions;

    const minFractionDigits = decimalPlaces ? 1 : undefined;
    const maxFractionDigits = decimalPlaces;

    const className = isValid ? undefined : 'p-invalid';

    return (
        <InputNumber
            value={data}
            id={id}
            min={minimum}
            max={maximum}
            step={step}
            useGrouping={!!groupNumbers}
            minFractionDigits={minFractionDigits}
            maxFractionDigits={maxFractionDigits}
            disabled={!enabled}
            className={className}
            onChange={(e) => handleChange(path, e.value)}
            autoFocus={focus}
        />
    );
};

/**
 * Default tester for numeric controls.
 * @type {RankedTester}
 */
export const inputNumberCellTester: RankedTester = rankWith(1, or(isNumberControl, isIntegerControl));

export default withJsonFormsCellProps(InputNumberCell);
