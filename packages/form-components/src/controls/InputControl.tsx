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
        const displayInfo = required;
        const info = required ? 'This is a required field' : undefined;
        const help = showDescription
            ? description
            : !isValid
                ? errors
                : null;

        const className = isValid ? undefined : 'p-invalid';

        const labelText = isPlainLabel(label) ? label : label.default;
        const cell = maxBy(cells, r => r.tester(uischema, schema));
        if (cell === undefined || cell.tester(uischema, schema) === NOT_APPLICABLE) {
            console.warn('No applicable cell found.', uischema, schema);
            return null;
        }

        return (
            <div className="p-field ">
                <div className="p-inputgroup">
                    <span className="p-float-label">
                        <DispatchCell
                            uischema={uischema}
                            schema={schema}
                            path={path}
                            id={id}
                        />
                        <label htmlFor={id} id={id + '-label'}>{labelText}</label>
                    </span>
                    {displayInfo && <span className="p-inputgroup-addon" style={{borderLeft: 0}} title={info} p-aria-label={info}><i className="pi pi-info-circle"></i></span>}
                </div>
            </div>
        );
    }
}

export const inputControlTester: RankedTester = rankWith(1, isControl);
export default withJsonFormsControlProps(InputControl);
