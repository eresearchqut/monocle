import React from 'react';
import {
    ControlProps,
    ControlState, isControl,
    isDescriptionHidden,
    isPlainLabel,
    NOT_APPLICABLE, RankedTester, rankWith
} from '@jsonforms/core';
import {Control, DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';

import merge from 'lodash/merge';
import maxBy from 'lodash/maxBy';
import {Input} from "@trrf/form-definition";

export class InputControl extends Control<ControlProps, ControlState> {
    render() {
        const {
            schema,
            description,
            errors,
            id,
            label,
            uischema,
            visible,
            config,
            path,
            required,
            cells
        } = this.props;

        if (!visible) {
            return null;
        }

        const isValid = errors.length === 0;
        const appliedUiSchemaOptions = merge({}, config, uischema.options);
        const showDescription = !isDescriptionHidden(
            visible,
            description as string,
            this.state.isFocused,
            appliedUiSchemaOptions.showUnfocusedDescription
        );

        const requiredMessage = required ? 'This is a required field' : undefined;
        const help = showDescription
            ? description
            : !isValid
                ? errors
                : null;


        const labelText = isPlainLabel(label) ? label : label.default;
        const cell = maxBy(cells, r => r.tester(uischema, schema));
        if (cell === undefined || cell.tester(uischema, schema) === NOT_APPLICABLE) {
            console.warn('No applicable cell found.', uischema, schema);
            return null;
        }

        const dispatchCell = (<DispatchCell
            uischema={uischema}
            schema={schema}
            path={path}
            id={id}
        />)

        const input = appliedUiSchemaOptions.input as Input;

        if (input.inputType === 'boolean') {
            return (
                <div className="p-field-checkbox">
                    {dispatchCell}
                    <label htmlFor={id} id={id + '-label'} className="p-checkbox-label">{labelText}</label>
                </div>
            )
        }

        return (
            <div className="p-field ">
                <div className="p-inputgroup">
                    <span className="p-float-label">
                        {dispatchCell}
                        <label htmlFor={id} id={id + '-label'}>{labelText}</label>
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
