import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {FormPreview, FormPreviewProps} from "./FormPreview";

export default {
    title: 'Component/FormPreview',
    component: FormPreview
} as Meta;

const Template: Story<FormPreviewProps> =
    (props) =>
        <FormPreview {...props} />
Template.bind({});

export const Example = Template.bind({});
Example.args = {
    data: {

            firstSection: {
                textValue: "I am some text"
            }

    },
    definition: {
        name: 'Example Form',
        sections: [
            {
                name: 'First Section',
                inputs: [
                    {
                        inputType: 'text',
                        maxLength: 100,
                        minLength: 200,
                        name: 'Text Value',
                        required: true
                    },
                    {
                        inputType: 'text',
                        name: 'Multiline Text Value',
                        multiline: true
                    },
                    {
                        inputType: 'currency',
                        name: 'Currency',
                        currencyCode: 'AUD',
                        currencyDisplay: 'symbol'
                    },
                    {
                        inputType: 'boolean',
                        name: 'Unrequired Truthy',
                    },
                    {
                        inputType: 'boolean',
                        required: true,
                        name: 'Required Truthy',
                    },
                    {
                        inputType: 'date',
                        required: true,
                        name: 'Datum',
                    }
                ]
            }
        ]
    }
};








