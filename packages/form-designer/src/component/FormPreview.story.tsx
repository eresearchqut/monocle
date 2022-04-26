import * as React from 'react';

import { Meta, Story } from '@storybook/react';
import { FormPreview, FormPreviewProps } from './FormPreview';

export default {
    title: 'FormDesigner/FormPreview',
    component: FormPreview,
} as Meta;

const Template: Story<FormPreviewProps> = (props) => <FormPreview {...props} />;
Template.bind({});

export const Example = Template.bind({});
Example.args = {
    data: {
        firstSection: {
            textValue: 'I am some text',
            currency: 99.99,
            requiredTruthy: true,
        },
        patientDetails: {
            patientName: 'Benjamin Button',
        },
        biobank: {
            aTray: {
                width: 50,
                length: 30,
                samples: [
                    { row: 0, col: 0, id: 'sample A' },
                    { row: 0, col: 9, id: 'sample B' },
                    { row: 0, col: 19, id: 'sample C' },
                    { row: 0, col: 29, id: 'sample D' },
                    { row: 0, col: 39, id: 'sample E' },
                    { row: 0, col: 49, id: 'sample F' },
                    { row: 15, col: 33, id: 'sample X', highlighted: true },
                ],
            },
        },
    },
    definition: require('./definition.story.json'),
    locale: 'en-AU',
};

export const BiobankExample = Template.bind({});
BiobankExample.args = {
    data: {
        biobank: {
            exampleTray: {
                width: 10,
                length: 10,
                samples: [
                    { row: 3, col: 1, id: 'sample A' },
                    { row: 4, col: 0, id: 'sample B' },
                    { row: 4, col: 1, id: 'sample C', highlighted: true },
                    { row: 4, col: 2, id: 'sample D' },
                    { row: 5, col: 1, id: 'sample E' },
                ],
            },
        },
    },
    definition: require('./biobank-definition.story.json'),
    locale: 'en-AU',
};
