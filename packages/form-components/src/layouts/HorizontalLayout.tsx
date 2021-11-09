import React, { FunctionComponent } from 'react';
import {
  HorizontalLayout,
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  LayoutProps,
  RankedTester,
  rankWith,
  uiTypeIs,
} from '@jsonforms/core';
import { JsonFormsDispatch, withJsonFormsLayoutProps } from '@jsonforms/react';
import isEmpty from 'lodash/isEmpty';

const renderChildren = (
  layout: HorizontalLayout,
  schema: JsonSchema,
  path: string,
  renderers: JsonFormsRendererRegistryEntry[] | undefined,
  cells: JsonFormsCellRendererRegistryEntry[] | undefined
) => {
  if (isEmpty(layout.elements)) {
    return [];
  }
  return layout.elements.map((child, index) => {
    return (
      <div key={`${path}-${index}`} className="p-col">
        <JsonFormsDispatch renderers={renderers} cells={cells} uischema={child} schema={schema} path={path} />
      </div>
    );
  });
};

const HorizontalLayoutRenderer: FunctionComponent<LayoutProps> = ({
  schema,
  uischema,
  visible,
  renderers,
  cells,
  path,
}: LayoutProps) => {
  const horizontalLayout = uischema as HorizontalLayout;
  if (!visible) {
    return null;
  }
  return <div className="p-grid p-fluid">{renderChildren(horizontalLayout, schema, path, renderers, cells)}</div>;
};

/**
 * Default tester for a horizontal layout.
 * @type {RankedTester}
 */
export const horizontalLayoutTester: RankedTester = rankWith(1, uiTypeIs('HorizontalLayout'));

export default withJsonFormsLayoutProps(HorizontalLayoutRenderer);
