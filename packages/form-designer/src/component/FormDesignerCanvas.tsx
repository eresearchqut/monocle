import React, { FunctionComponent } from 'react';
import { Form } from '@eresearchqut/form-definition';
import { JsonForms } from '@jsonforms/react';
import {
  cells,
  InputBooleanControl,
  inputBooleanControlTester,
  InputControl,
  inputControlTester,
} from '@eresearchqut/form-components';

import { JsonFormsCore, RankedTester } from '@jsonforms/core';
import AnyOfLayout, { anyOfLayoutTester } from './AnyOfLayout';
import VerticalLayout, { verticalLayoutTester } from './VerticalLayout';
import OptionsLayout, { optionsLayoutTester } from './OptionsLayout';
import ComponentLayout, { componentsLayoutTester } from './ComponentsLayout';

const renderers: { tester: RankedTester; renderer: any }[] = [
  { tester: optionsLayoutTester, renderer: OptionsLayout },
  { tester: anyOfLayoutTester, renderer: AnyOfLayout },
  { tester: componentsLayoutTester, renderer: ComponentLayout },
  { tester: inputControlTester, renderer: InputControl },
  { tester: inputBooleanControlTester, renderer: InputBooleanControl },
  { tester: verticalLayoutTester, renderer: VerticalLayout },
];

export interface FormDesignerCanvasProps {
  definition: Form;
  locale?: string;

  onChange?(state: Pick<JsonFormsCore, 'data' | 'errors'>): void;
}

// TODO, the form schema should probable be a prop
const schema = require('../schema/form.json');

export const FormDesignerCanvas: FunctionComponent<FormDesignerCanvasProps> = ({ definition, onChange, locale }) => {
  const config = {
    locale,
    booleansAreTrueOrFalse: true,
  };

  return (
    <div className="form-designer-canvas">
      <JsonForms
        config={config}
        data={definition}
        schema={schema}
        renderers={renderers}
        cells={cells}
        onChange={onChange}
      />
    </div>
  );
};
