import React, {useMemo} from 'react';
import {CellProps, optionIs, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import merge from 'lodash/merge';

import "easymde/dist/easymde.min.css";
import SimpleMdeReact from "react-simplemde-editor";

export interface InputMarkdownCellOptions {
    required?: boolean,
    focus?: boolean
}

export const InputMarkdownCell = (props: CellProps) => {
    const {
        data,
        id,
        path,
        handleChange,
        config,
        uischema,
        visible = true
    } = props;
    const {focus, required} = merge({}, config, uischema.options) as InputMarkdownCellOptions;
    const options = useMemo(() => {
        return {
            autofocus: focus
        };
    }, [uischema]);
    if (!visible) {
        return null;
    }
    return (
        <SimpleMdeReact
            id={id}
            aria-required={required}
            value={data}
            onChange={(value) => handleChange(path, value)}
            options={options}

        />
    );

};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputMarkdownCellTester: RankedTester = rankWith(3, optionIs('type', 'markdown'));

export default withJsonFormsCellProps(InputMarkdownCell);
