import React from 'react';
import {ControlProps, ControlState, isControl, NOT_APPLICABLE, RankedTester, rankWith} from '@jsonforms/core';
import {Control, DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';
import maxBy from 'lodash/maxBy';

export class InputControl extends Control<ControlProps, ControlState> {
    render() {

        const {
            schema,
            id,
            label,
            uischema,
            visible,
            path,
            required,
            cells
        } = this.props;


        if (!visible) {
            return null;
        }

        const requiredMessage = required ? 'This is a required field' : undefined;
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
            <div className="p-inputgroup p-field">
                <span className="p-float-label">
                    {dispatchCell}
                    <label htmlFor={id} id={id + '-label'}>{label}</label>
                </span>
                {required &&
                <span className="p-inputgroup-addon" style={{borderLeft: 0}} title={requiredMessage}
                      p-aria-label={requiredMessage}><i
                    className="pi pi-info-circle"></i></span>}
            </div>
        );
    }
}

export const inputControlTester: RankedTester = rankWith(1, isControl);
export default withJsonFormsControlProps(InputControl);
