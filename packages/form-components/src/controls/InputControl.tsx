import React from 'react';
import {
    ControlProps,
    ControlState,
    isControl,
    isDescriptionHidden,
    NOT_APPLICABLE,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {Control, DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';

import merge from 'lodash/merge';
import maxBy from 'lodash/maxBy';

export class InputControl extends Control<ControlProps, ControlState> {
    render() {

        const {
            schema,
            id,
            label,
            uischema,
            visible,
            config,
            path,
            required,
            cells
        } = this.props;

        console.log(this.props);

        if (!visible) {
            return null;
        }

        const appliedUiSchemaOptions = merge({}, config, uischema.options);
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

        const input = appliedUiSchemaOptions.input;

        if (input?.inputType === 'boolean') {
            return (
                <div className="p-field-checkbox">
                    {dispatchCell}
                    <label htmlFor={id} id={id + '-label'} className="p-checkbox-label">{label}</label>
                </div>
            )
        }

        return (
            <div className="p-field">
                <div className="p-inputgroup p-fluid">
                    <span className="p-float-label">
                        {dispatchCell}
                        <label htmlFor={id} id={id + '-label'}>{label}</label>
                    </span>
                    {required &&
                    <span className="p-inputgroup-addon" style={{borderLeft: 0}} title={requiredMessage} p-aria-label={requiredMessage}><i
                        className="pi pi-info-circle"></i></span>}
                </div>
            </div>
        );
    }
}

export const inputControlTester: RankedTester = rankWith(1, isControl);
export default withJsonFormsControlProps(InputControl);
