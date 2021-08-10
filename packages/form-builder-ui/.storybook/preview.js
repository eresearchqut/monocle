export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

import 'primereact/resources/themes/fluent-light/theme.css'
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import {Card} from 'primereact/card';

import React from 'react';

export const decorators = [
  (Story) => (
      <Card>
        <Story />
      </Card>
  ),
];
