import React from 'react';
import {ControlProps, isControl, NOT_APPLICABLE, RankedTester, rankWith} from '@jsonforms/core';
import {DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';
import maxBy from 'lodash/maxBy';
import { Message } from 'primereact/message';

export const InputControl = (props: ControlProps) => {
    const {
        id,
        schema,
        label,
        uischema,
        visible,
        path,
        required,
        cells,
        errors
    } = props;

    if (!visible) {
        return null;
    }

    const {description} = schema;
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
            <label htmlFor={id} aria-required={required}>{label}{required &&
            <i className="tooltip pi pi-exclamation-circle p-text-secondary p-overlay-badge p-ml-1"
               data-pr-tooltip={`${label} is required`}
               data-pr-position="right"
               data-pr-at="right+5 top"
               data-pr-my="left center-2">
            </i>
            }
            </label>
            {description &&
            <div className="p-text-light p-mb-2">{description}</div>
            }
            {dispatchCell}
            {errors &&
            <small id={`${id}-error`} className="p-text-light p-error p-mt-2">{errors}</small>
            }
        </div>
    );

}

export const inputControlTester: RankedTester = rankWith(1, isControl);
export default withJsonFormsControlProps(InputControl);
