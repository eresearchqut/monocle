import React from 'react';
import {CellProps, optionIs, RankedTester, rankWith} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';

import "easymde/dist/easymde.min.css";
import SimpleMdeReact from "react-simplemde-editor";

export const InputMarkdownCell = (props: CellProps) => {
    const {
        data,
        id,
        path,
        handleChange,
        visible = true
    } = props;

    if (!visible) {
        return null;
    }
    return (
        <SimpleMdeReact
            id={id}
            value={data}
            onChange={(value) => handleChange(path, value)}
        />
    );

};

/**
 * Default tester for text-based/string controls.
 * @type {RankedTester}
 */
export const inputMarkdownCellTester: RankedTester = rankWith(3, optionIs('type', 'markdown'));

export default withJsonFormsCellProps(InputMarkdownCell);
