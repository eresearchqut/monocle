import isEmpty from 'lodash/isEmpty';
import {
    findUISchema,
    GroupLayout,
    isObjectControl,
    RankedTester,
    rankWith,
    StatePropsOfControlWithDetail,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsDetailProps } from '@jsonforms/react';
import React, { FunctionComponent, useMemo } from 'react';

const ObjectLayout: FunctionComponent<StatePropsOfControlWithDetail> = ({
    renderers,
    cells,
    uischemas,
    schema,
    label,
    path,
    visible,
    enabled,
    uischema,
    rootSchema,
}: StatePropsOfControlWithDetail) => {
    const detailUiSchema = useMemo(
        () => findUISchema(uischemas ? uischemas : [], schema, uischema.scope, path, 'Group', uischema, rootSchema),
        [uischemas, schema, path, uischema, rootSchema]
    );
    if (isEmpty(path)) {
        detailUiSchema.type = 'VerticalLayout';
    } else {
        (detailUiSchema as GroupLayout).label = label;
    }

    return (
        <JsonFormsDispatch
            visible={visible}
            enabled={enabled}
            schema={schema}
            uischema={detailUiSchema}
            path={path}
            renderers={renderers}
            cells={cells}
        />
    );
};

export const objectLayoutTester: RankedTester = rankWith(2, isObjectControl);
export default withJsonFormsDetailProps(ObjectLayout);
