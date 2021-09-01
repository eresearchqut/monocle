import React, { useCallback, useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import {TabView, TabPanel, TabViewTabChangeParams} from 'primereact/tabview';

import {
    CombinatorProps, ControlElement,
    createCombinatorRenderInfos,
    createDefaultValue,
    isOneOfControl,
    JsonSchema,
    RankedTester,
    rankWith,
    resolveSubSchemas
} from '@jsonforms/core';

import {
  JsonFormsDispatch,
  withJsonFormsOneOfProps
} from '@jsonforms/react';

import CombinatorProperties from './CombinatorProperties';

const oneOf = 'oneOf';
const OneOfLayout =
  ({ handleChange, schema, path, renderers, cells, rootSchema, visible, indexOfFittingSchema, uischema, uischemas, data }: CombinatorProps) => {

    const [selectedIndex, setSelectedIndex] = useState(indexOfFittingSchema || 0);
    const _schema = resolveSubSchemas(schema as JsonSchema, rootSchema, oneOf) ;
    const oneOfRenderInfos = createCombinatorRenderInfos(
      (_schema as JsonSchema).oneOf as JsonSchema[],
      rootSchema,
      oneOf,
      uischema as ControlElement,
      path,
      uischemas
      );

    if (!visible || !schema?.oneOf) {
        return undefined;
    }

    const openNewTab = (newIndex: number) => {
      handleChange(
        path,
        createDefaultValue((schema.oneOf as JsonSchema[])[newIndex])
      );
      setSelectedIndex(newIndex);
    }

    const handleTabChange = useCallback((_event: TabViewTabChangeParams) => {

      if(isEmpty(data)) {
        openNewTab(_event.index)
      }
    }, [setSelectedIndex, data]);

    return (
        <React.Fragment>
            <CombinatorProperties
              schema={_schema}
              combinatorKeyword={'oneOf'}
              path={path}
            />
            <TabView activeIndex={selectedIndex} onTabChange={handleTabChange}>
                {
                    oneOfRenderInfos.map((oneOfRenderInfo, oneOfIndex) =>
                    <TabPanel key={oneOfRenderInfo.label} header={oneOfRenderInfo.label} >
                        selectedIndex === oneOfIndex && (
                        <JsonFormsDispatch
                            key={oneOfIndex}
                            schema={oneOfRenderInfo.schema}
                            uischema={oneOfRenderInfo.uischema}
                            path={path}
                            renderers={renderers}
                            cells={cells}
                        />
                        )
                    </TabPanel>
                  )
                }
            </TabView>
        </React.Fragment>
    );
  };

export const oneOfLayoutTester: RankedTester = rankWith(3, isOneOfControl);
// @ts-ignore
export default withJsonFormsOneOfProps(OneOfLayout);
