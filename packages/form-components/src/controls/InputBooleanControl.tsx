import React from 'react';
import {
    ControlProps,
    ControlState,
    isBooleanControl,
    NOT_APPLICABLE,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {Control, DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';

import maxBy from 'lodash/maxBy';

export class InputBooleanControl extends Control<ControlProps, ControlState> {
    render() {

        const {
            schema,
            id,
            label,
            uischema,
            visible,
            path,
            cells
        } = this.props;

        if (!visible) {
            return null;
        }

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
            <div className="p-field-checkbox">
                {dispatchCell}
                <label htmlFor={id} id={id + '-label'} className="p-checkbox-label">{label}</label>
            </div>
        )

    }
}

export const inputBooleanControlTester: RankedTester = rankWith(2, isBooleanControl);
export default withJsonFormsControlProps(InputBooleanControl);
