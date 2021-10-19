import React, {useState} from 'react';
import {
    and, composePaths, ControlProps, DispatchPropsOfMultiEnumControl,
     isAnyOfControl,
    optionIs, OwnPropsOfEnum,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import {Checkbox, CheckboxChangeParams} from 'primereact/checkbox';
import {withJsonFormsMultiEnumProps} from "@jsonforms/react/lib/JsonFormsContext";

export const InputCheckboxGroupCell = (props: ControlProps & OwnPropsOfEnum & DispatchPropsOfMultiEnumControl) => {
    const {id, data, enabled = true, visible = true, path, handleChange, options} = props;

    const [values, setValues] = useState<string[]>(data || []);

    const onChange = (e: CheckboxChangeParams) => {
        setValues((currentlySelected) => {
            const selected = [...currentlySelected];
            if (e.checked) {
                selected.push(e.value);
            }
            else {
                selected.splice(selected.indexOf(e.value), 1);
            }
            handleChange(path, selected);
            return selected;
        })
    }

    if (!visible || !options) {
        return null;
    }

    return (
        <div className="p-d-flex p-flex-column p-flex-md-row">
            {options.map((option, index) => (
                <div className='p-field-checkbox p-mr-md-2' key={composePaths(path, `${index}`)}>
                    <Checkbox
                        disabled={!enabled}
                        inputId={composePaths(path, `${index}`)}
                        name={id}
                        value={option.value}
                        onChange={onChange}
                        checked={values.indexOf(option.value) > -1}
                    />
                    <label htmlFor={composePaths(path, `${index}`)}>{option.label}</label>
                </div>
            ))}
        </div>
    );
};


export const inputCheckboxGroupCellTester: RankedTester = rankWith(
    3,
    and(isAnyOfControl, optionIs('format', 'checkbox'))
);

export default withJsonFormsMultiEnumProps(InputCheckboxGroupCell);


