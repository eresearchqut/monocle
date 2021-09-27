import React from 'react';
import {ControlProps, ControlState, isControl, NOT_APPLICABLE, RankedTester, rankWith} from '@jsonforms/core';
import {Control, DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';
import maxBy from 'lodash/maxBy';
import merge from 'lodash/merge';

export class InputControl extends Control<ControlProps, ControlState> {
    render() {

        const {
            schema,
            id,
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
            <div className="p-field">
                <label htmlFor={id} id={id + '-label'}>{label}</label>
                { description &&
                <div className="p-text-light p-mb-2">{description}</div>
                }
                <div className="p-inputgroup" >
                    {dispatchCell}
                    {required &&
                    <span className="p-inputgroup-addon" style={{borderLeft: 0}} title={requiredMessage}
                          p-aria-label={requiredMessage}><i
                        className="pi pi-info-circle"></i></span>}
                </div>
            </div>
        );
    }
}

export const inputControlTester: RankedTester = rankWith(1, isControl);
export default withJsonFormsControlProps(InputControl);
