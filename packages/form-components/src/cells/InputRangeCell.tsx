import React, {useState, useEffect} from 'react';
import {withJsonFormsCellProps} from '@jsonforms/react';
import {Slider, SliderChangeParams} from 'primereact/slider';

import merge from "lodash/merge";
import {and, CellProps, optionIs, RankedTester, rankWith, uiTypeIs} from "@jsonforms/core";

export interface InputRangeCellOptions {
    orientation?: 'horizontal' | 'vertical'
    animate?: boolean,

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

    const [value, setValue] = useState(data);
    const {minimum, maximum, multipleOf} = schema;
    const {orientation, range} = merge({}, config, uischema.options) as InputRangeCellOptions;

    if (!visible) {
        return null;
    }

    const onChange = (e: SliderChangeParams) => {
        if (e.originalEvent.type === 'click') {
            handleChange(path, e.value);
        }
        setValue(() => e.value);
    }

    return (
        <Slider id={id}
                value={value}
                disabled={!enabled}
                min={minimum}
                max={maximum}
                orientation={orientation}
                step={multipleOf}
                range={range}
                onChange={onChange}
                onSlideEnd={(e) => handleChange(path, value)}

        />
    );
};


/**
 * Default tester for range controls.
 * @type {RankedTester}
 */
export const inputRangeCellTester: RankedTester = rankWith(2, and(
    uiTypeIs('Control'),
    optionIs('type', 'range')
));

export default withJsonFormsCellProps(InputRangeCell);
