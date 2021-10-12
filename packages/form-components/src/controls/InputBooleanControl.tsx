import React, {Fragment} from 'react';
import {
    ControlProps,
    isBooleanControl,
    NOT_APPLICABLE,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';

import maxBy from 'lodash/maxBy';
import merge from "lodash/merge";

export const InputBooleanControl = (props: ControlProps) => {

    const {
        schema,
        id,
        label,
        uischema,
        visible,
        path,
        cells,
        config
    } = props;
    

    if (!visible) {
        return null;
    }

    const {description} = merge({}, config, uischema.options);
    const cell = maxBy(cells, r => r.tester(uischema, schema));

    if (cell === undefined || cell.tester(uischema, schema) === NOT_APPLICABLE) {
        return null;
    }

    const dispatchCell = (<DispatchCell
        uischema={uischema}
        schema={schema}
        path={path}
        cells={cells}
        id={id}
    />)


    return (
        <Fragment>
            <div className="p-field-checkbox">
                {dispatchCell}
                <label htmlFor={id} id={id + '-label'} className="p-checkbox-label">{label}</label>
            </div>
            { description &&
            <div className="p-text-light p-mb-2">{description}</div>
            }
        </Fragment>
    )
}

export const inputBooleanControlTester: RankedTester = rankWith(2, isBooleanControl);
export default withJsonFormsControlProps(InputBooleanControl);
