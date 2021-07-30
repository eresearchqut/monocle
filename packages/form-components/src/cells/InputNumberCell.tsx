import React from 'react';
import {
    CellProps, isIntegerControl, isNumberControl, or,
    RankedTester,
    rankWith, UISchemaElement
} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import {InputNumber} from 'primereact/inputnumber';
import merge from "lodash/merge";

export const InputNumberCell = (props: CellProps) => {
    const {
        config,
        data,
        id,
        enabled,
        uischema,
        schema,
        path,
        handleChange,
        errors
    } = props;

    const appliedUiSchemaOptions = merge({}, config, uischema.options);

    const {minimum, maximum} = schema;
    const {step, decimalPlaces, currencyCode, currencyDisplay} = appliedUiSchemaOptions.input;
    const {locale} = appliedUiSchemaOptions || 'en-AU';
    const mode = currencyCode ? 'currency' : undefined;

    const className = [
        mode === 'currency' ? 'p-inputwrapper-filled' : undefined,
        errors.length === 0 ? undefined : 'p-invalid'
    ].filter((className): className is string => !!className ).join(' ');

    return (
        <InputNumber
            value={data || ''}
            id={id}
            min={minimum}
            max={maximum}
            step={step}
            mode={mode}
            locale={locale}
            currency={currencyCode}
            currencyDisplay={currencyDisplay}
            maxFractionDigits={decimalPlaces}
            disabled={!enabled}
            className={className}
            onChange={(e) => handleChange(path, e.value)}
            autoFocus={uischema.options && uischema.options.focus}
        />
    );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputNumberCellTester: RankedTester = rankWith(1, or(isNumberControl, isIntegerControl));

export default withJsonFormsCellProps(InputNumberCell);
