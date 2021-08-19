import React from 'react';

import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/fluent-light/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import {Card} from "primereact/card";


export const parameters = {
    actions: {argTypesRegex: "^on[A-Z].*"},
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
            <Story/>
        </Card>
    ),
];
