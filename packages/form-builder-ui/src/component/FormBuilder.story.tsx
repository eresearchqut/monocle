import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {FormBuilder, FormBuilderProps} from "./FormBuilder";

export default {
    title: 'Component/FormBuilder',
    component: FormBuilder
} as Meta;

const Template: Story<FormBuilderProps> =
    ({definition}) =>
        <FormBuilder definition={definition}/>
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








