import React from 'react';
import { Card } from 'primereact/card';

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '../src/layout/layout.scss';
import startCase from 'lodash/startCase';
import { camelCase } from 'lodash';

const themes = [
  'fluent-light',
  'bootstrap4-light-purple',
  'bootstrap4-dark-blue',
  'bootstrap4-dark-purple',
  'md-light-indigo',
  'md-light-deeppurple',
  'md-dark-indigo',
  'md-dark-deeppurple',
  'mdc-light-indigo',
  'mdc-light-deeppurple',
  'mdc-dark-indigo',
  'mdc-dark-deeppurple',
  'tailwind-light',
  'saga-blue',
  'saga-green',
  'saga-orange',
  'saga-purple',
  'vela-blue',
  'vela-green',
  'vela-orange',
  'vela-purple',
  'arya-blue',
  'arya-green',
  'arya-orange',
  'arya-purple',
  'nova',
  'nova-alt',
  'nova-accent',
  'luna-amber',
  'luna-blue',
  'luna-green',
  'luna-pink',
  'rhea',
];

const stylesheets = themes.map((theme) => ({
  id: camelCase(theme),
  title: startCase(theme),
  url: `https://cdnjs.cloudflare.com/ajax/libs/primereact/6.6.0/resources/themes/${theme}/theme.min.css`,
}));

export const parameters = {
  stylesheetToggle: {
    stylesheets,
  },
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  (Story) => (
    <Card>
      <Story />
    </Card>
  ),
];
