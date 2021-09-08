import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {FormDesigner, FormDesignerProps} from "./FormDesigner";

export default {
    title: 'Component/FormDesigner',
    component: FormDesigner
} as Meta;

const Template: Story<FormDesignerProps> =
    (props) =>
        <FormDesigner {...props} />
Template.bind({});

export const Example = Template.bind({});
Example.args = {
    data: {
            firstSection: {
                textValue: "I am some text",
                currency: 99.99,
                requiredTruthy: true
            }
    },
    definition: {
        name: 'Example Form',
        sections: [
            {
                name: 'First Section',
                inputs: [
                    {
                        type: 'text',
                        maxLength: 100,
                        minLength: 200,
                        name: 'Text Value',
                        required: true
                    },
                    {
                        type: 'text',
                        name: 'Multiline Text Value',
                        multiline: true
                    },
                    {
                        type: 'currency',
                        name: 'Currency',
                        currencyCode: 'AUD',
                        currencyDisplay: 'symbol'
                    },
                    {
                        type: 'boolean',
                        name: 'Unrequired Truthy',
                    },
                    {
                        type: 'boolean',
                        required: true,
                        name: 'Required Truthy',
                    },
                    {
                        type: 'date',
                        required: true,
                        name: 'Datum',
                    }
                ]
            }
        ]
    }
};








