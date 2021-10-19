import React from 'react';
import {
    and, composePaths,
    EnumCellProps,
    isEnumControl, isOneOfEnumControl, optionIs,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import {withJsonFormsEnumCellProps} from '@jsonforms/react';
import {RadioButton} from 'primereact/radiobutton';

export const InputRadioCell = (props: EnumCellProps) => {
    const {id, data, enabled = true, visible = true, path, handleChange, options} = props;

    if (!visible || !options) {
        return null;
    }


    return (
        <React.Fragment>
            {options.map((option, index) => (
                <div className='p-field-radiobutton' key={composePaths(path, `${index}`)}>
                    <RadioButton
                        disabled={!enabled}
                        id={composePaths(path, `${index}`)}
                        name={id}
                        value={option.value}
                        onChange={(e) => handleChange(path, option.value)}
                        checked={data === option.value}
                    />
                    <label htmlFor={composePaths(path, `${index}`)}>{option.label}</label>
                </div>
            ))}
        </React.Fragment>
    );
};


export const inputRadioCellTester: RankedTester = rankWith(
    3,
    and(isOneOfEnumControl, optionIs('format', 'radio'))
);

export default withJsonFormsEnumCellProps(InputRadioCell);


