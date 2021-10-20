import React, {ComponentType, useMemo, useState} from 'react';
import {
    and,
    composePaths,
    hasType,
    RankedTester,
    rankWith,
    schemaMatches,
    schemaSubPathMatches,
    CellProps, EnumOption, JsonSchema, oneOfToEnumOptionMapper
} from '@jsonforms/core';
import {MultiSelect} from 'primereact/multiselect';
import {withJsonFormsCellProps} from "@jsonforms/react";

export const InputMultiselectCell = (props: CellProps) => {

    const {id, data, enabled = true, visible = true, path, handleChange, schema, isValid = true} = props;
    const options: EnumOption[] = ((schema.items as JsonSchema)?.oneOf as JsonSchema[]).map(oneOfToEnumOptionMapper);

    if (!visible || !options) {
        return null;
    }
    const className = isValid ? undefined : 'p-invalid';

    return (
        <MultiSelect
            className={className}
            disabled={!enabled}
            id={id}
            value={data} options={options}
            onChange={(e) =>  handleChange(path, e.value)}
        />
    );
};


export const inputMultiselectCellTester: RankedTester = rankWith(
    2,
    and(
        schemaMatches(schema => hasType(schema, 'array') && !Array.isArray(schema.items)),
        schemaSubPathMatches('items', schema => schema.hasOwnProperty("oneOf")),
    )
);

export default withJsonFormsCellProps(InputMultiselectCell);


