
import React, { useCallback } from 'react';

import {
  ArrayLayoutProps,
  isObjectArrayWithNesting,
  RankedTester,
  rankWith
} from '@jsonforms/core';
import { ArrayLayout } from './ArrayLayout';
import { withJsonFormsArrayLayoutProps } from '@jsonforms/react';

export const ArrayLayoutRenderer = ({
  visible,
  enabled,
  id,
  uischema,
  schema,
  label,
  rootSchema,
  renderers,
  cells,
  data,
  path,
  errors,
  uischemas,
  addItem
}: ArrayLayoutProps) => {

  const addItemCallback = useCallback((p: string, value: any) => addItem(p, value), [
    addItem
  ]);

  if (!visible) {
    return null;
  }

  return (

      <ArrayLayout
        label={label}
        uischema={uischema}
        schema={schema}
        id={id}
        rootSchema={rootSchema}
        errors={errors}
        enabled={enabled}
        visible={visible}
        data={data}
        path={path}
        addItem={addItemCallback}
        renderers={renderers}
        cells={cells}
        uischemas={uischemas}
      />

  );
};

export const arrayLayoutTester: RankedTester = rankWith(
  4,
  isObjectArrayWithNesting
);

export default withJsonFormsArrayLayoutProps(ArrayLayoutRenderer);
