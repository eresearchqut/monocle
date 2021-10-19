import React from 'react';
import {
    and, composePaths,
    EnumCellProps,
    isEnumControl, isOneOfEnumControl, optionIs,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import {withJsonFormsOneOfEnumCellProps} from '@jsonforms/react';
import {RadioButton} from 'primereact/radiobutton';

export const InputRadioGroupCell = (props: EnumCellProps) => {
    const {id, data, enabled = true, visible = true, path, handleChange, options} = props;

    if (!visible || !options) {
        return null;
    }

    return (
        <div className="p-d-flex p-flex-column p-flex-md-row">
            {options.map((option, index) => (
                <div className='p-field-radiobutton p-mr-md-2' key={composePaths(path, `${index}`)}>
                    <RadioButton
                        disabled={!enabled}
                        inputId={composePaths(path, `${index}`)}
                        name={id}
                        value={option.value}
                        onChange={(e) => handleChange(path, option.value)}
                        checked={data === option.value}
                    />
                    <label htmlFor={composePaths(path, `${index}`)}>{option.label}</label>
                </div>
            ))}
        </div>
    );
};


export const inputRadioGroupCellTester: RankedTester = rankWith(
    3,
    and(isOneOfEnumControl, optionIs('format', 'radio'))
);

export default withJsonFormsOneOfEnumCellProps(InputRadioGroupCell);


