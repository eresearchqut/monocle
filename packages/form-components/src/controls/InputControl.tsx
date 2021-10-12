import React from 'react';
import {ControlProps, ControlState, isControl, NOT_APPLICABLE, RankedTester, rankWith} from '@jsonforms/core';
import {Control, DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';
import maxBy from 'lodash/maxBy';
import merge from 'lodash/merge';
import {Avatar} from "primereact/avatar";

export class InputControl extends Control<ControlProps, ControlState> {
    render() {

        const {
            id,
            schema,
            label,
            uischema,
            config,
            visible,
            path,
            required,
            cells
        } = this.props;

        if (!visible) {
            return null;
        }

        const appliedUiSchemaOptions = merge({}, config, uischema.options);
        const {description} = appliedUiSchemaOptions;
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
            <div className="p-field p-fluid">
                <label htmlFor={id} aria-required={required}>{label}{required && <i className='pi pi-exclamation-circle p-ml-2' title={`${label} is required`}></i>}</label>
                { description &&
                <div className="p-text-light p-mb-2">{description}</div>
                }
                {dispatchCell}
            </div>
        );
    }
}

export const inputControlTester: RankedTester = rankWith(1, isControl);
export default withJsonFormsControlProps(InputControl);
