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
        return (
            <div className="p-inputgroup" id={id}>
                <span className="p-float-label">
                    <DispatchCell
                        uischema={uischema}
                        schema={schema}
                        path={path}
                        id={id + '-input'}
                    />
                    <label htmlFor={id + '-input'} id={id + '-label'}>{labelText}</label>
                </span>
                { required && <span className="p-inputgroup-addon"><i className="pi pi-star"></i></span> }
            </div>
        );
    }
}

export const inputControlTester: RankedTester = rankWith(1, isControl);
export default withJsonFormsControlProps(InputControl);
