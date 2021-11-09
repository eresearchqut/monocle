import React from 'react';
import {
    CellProps,
    EnumOption,
    enumToEnumOptionMapper,
    isEnumControl,
    isOneOfEnumControl,
    JsonSchema,
    oneOfToEnumOptionMapper,
    or,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import { withJsonFormsEnumCellProps } from '@jsonforms/react';
import { Dropdown } from 'primereact/dropdown';

export const InputSelectCell = (props: CellProps) => {
    const { data, id, schema, enabled = true, visible = true, isValid = true, path, handleChange } = props;
    const options: EnumOption[] = schema.enum
        ? schema.enum.map(enumToEnumOptionMapper)
        : (schema.oneOf as JsonSchema[]).map(oneOfToEnumOptionMapper);

    if (!visible) {
        return null;
    }

    const className = isValid ? undefined : 'p-invalid';

    return (
        <Dropdown
            id={id}
            value={data}
            optionLabel="label"
            optionValue="value"
            options={options}
            disabled={!enabled}
            className={className}
            onChange={(e) => handleChange(path, e.value)}
        />
    );
};

export const inputSelectCellTester: RankedTester = rankWith(2, or(isEnumControl, isOneOfEnumControl));

export default withJsonFormsEnumCellProps(InputSelectCell);
