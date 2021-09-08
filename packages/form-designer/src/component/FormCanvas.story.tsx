import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {FormCanvas, FormCanvasProps} from "./FormCanvas";

export default {
    title: 'Component/FormCanvas',
    component: FormCanvas
} as Meta;

const Template: Story<FormCanvasProps> =
    ({definition}) =>
        <FormCanvas definition={definition}/>
Template.bind({});

export const Example = Template.bind({});
Example.args = {
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








