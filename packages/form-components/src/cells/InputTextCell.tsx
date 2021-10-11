import React from 'react';
import {CellProps, isStringControl, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import merge from 'lodash/merge';

import {InputText} from 'primereact/inputtext';
import {InputBooleanCellOptions} from "./InputBooleanCell";
import {InputTextarea} from "primereact/inputtextarea";

export interface InputTextCellOptions  {
    multiline?: boolean;

}

export const InputTextCell = (props: CellProps) => {
    const {
        data,
        id,
        enabled,
        schema,
        path,
        handleChange,
        isValid,
        config,
        uischema
    } = props;
    const {pattern} = schema;
    const keyFilter = pattern ? new RegExp(pattern) : undefined;

    const {multiline} = merge({}, config, uischema?.options) as InputBooleanCellOptions;

    const className = isValid ? undefined : 'p-invalid';

    if (multiline) {
        return (
            <InputTextarea
                value={data || ''}
                id={id}
                className={className}
                disabled={!enabled}
                onChange={(e) => handleChange(path, e.target.value)}
                autoFocus={uischema.options && uischema.options.focus}
            />
        );
    }

    return (
        <InputText
            value={data || ''}
            id={id}
            className={className}
            disabled={!enabled}
            onChange={(e) => handleChange(path, e.target.value)}
            keyfilter={keyFilter}
        />
    );
};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputTextCellTester: RankedTester = rankWith(1, isStringControl);

export default withJsonFormsCellProps(InputTextCell);
