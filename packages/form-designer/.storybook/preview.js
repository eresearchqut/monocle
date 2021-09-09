import React from 'react';
import {Card} from 'primereact/card';


import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import 'primeflex/primeflex.css';

import '../src/layout/layout.scss';
import 'primereact/resources/themes/fluent-light/theme.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

export const decorators = [
  (Story) => (
      <Card>
        <Story />
      </Card>
  ),
];