import React, { FunctionComponent } from 'react';
import { Form } from '@eresearchqut/form-definition';
import { JsonForms } from '@jsonforms/react';
import { cells, renderers } from '@eresearchqut/form-components';

import { findFormCompiler } from '@eresearchqut/form-compiler';

import { JsonFormsCore } from '@jsonforms/core';

export interface FormPreviewProps {
    definition: Form;
    data?: any;
    locale?: string;

    onChange?(state: Pick<JsonFormsCore, 'data' | 'errors'>): void;
}

export const FormPreview: FunctionComponent<FormPreviewProps> = ({ definition, data, onChange, locale }) => {
    const formCompiler = findFormCompiler(definition);
    const schema = formCompiler?.schema(definition);
    const ui = formCompiler?.ui(definition);
    const config = {
        locale,
    };

    return (
        <JsonForms
            data={data}
            uischema={ui}
            config={config}
            schema={schema}
            renderers={renderers}
            cells={cells}
            onChange={onChange}
        />
    );
};
