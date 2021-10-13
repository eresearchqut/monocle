import React from 'react';
import {withJsonFormsCellProps} from '@jsonforms/react';
import {Slider} from 'primereact/slider';

import merge from "lodash/merge";
import {CellProps, optionIs, RankedTester, rankWith} from "@jsonforms/core";

export interface InputRangeCellOptions {
    orientation?: 'horizontal' | 'vertical'
    animate?: boolean,
    step?: number,
    range?: boolean
}

export const InputRangeCell = (props: CellProps) => {
    const {
        id,
        config,
        data,
        uischema,
        schema,
        path,
        handleChange,
        enabled = true,
        visible = true
    } = props;

    const {minimum, maximum} = schema;
    const {orientation, range, step} = merge({}, config, uischema.options) as InputRangeCellOptions;

    if (!visible) {
        return null;
    }

    return (
        <Slider id={id}
                value={data}
                disabled={!enabled}
                min={minimum}
                max={maximum}
                orientation={orientation}
                step={step}
                range={range}
                onChange={(e) => handleChange(path, e.value)}
        />
    );
};


export const inputRangeCellTester: RankedTester = rankWith(2, optionIs('type', 'range'));

export default withJsonFormsCellProps(InputRangeCell);
