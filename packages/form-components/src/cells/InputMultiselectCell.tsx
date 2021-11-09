import React from 'react';
import {
    and,
    CellProps,
    EnumOption,
    hasType,
    JsonSchema,
    oneOfToEnumOptionMapper,
    RankedTester,
    rankWith,
    schemaMatches,
    schemaSubPathMatches,
} from '@jsonforms/core';
import { MultiSelect } from 'primereact/multiselect';
import { withJsonFormsCellProps } from '@jsonforms/react';

export const InputMultiselectCell = (props: CellProps) => {
    const { id, data, enabled = true, visible = true, path, handleChange, schema, isValid = true } = props;
    const options: EnumOption[] = ((schema.items as JsonSchema)?.oneOf as JsonSchema[]).map(oneOfToEnumOptionMapper);

    if (!visible || !options) {
        return null;
    }
    const className = isValid ? undefined : 'p-invalid';
    const value = Array.isArray(data) ? data : [];

    return (
        <MultiSelect
            display="chip"
            className={className}
            disabled={!enabled}
            id={id}
            value={value}
            options={options}
            onChange={(e) => handleChange(path, e.value)}
        />
    );
};

export const inputMultiselectCellTester: RankedTester = rankWith(
    2,
    and(
        schemaMatches((schema) => hasType(schema, 'array') && !Array.isArray(schema.items)),
        schemaSubPathMatches('items', (schema) => schema.hasOwnProperty('oneOf'))
    )
);

export default withJsonFormsCellProps(InputMultiselectCell);
