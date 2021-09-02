import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {ControlProps} from "@jsonforms/core";
import InputControl from "./InputControl";

import {initStoryStore} from "../storyStore";
import {cells, renderers} from "../index";
import {FormBuilder} from "./FormBuilder";
import {Form} from "@trrf/form-definition";

export default {
    title: 'Component/FormBuilder',
    component: FormBuilder
} as Meta;

const Template: Story<Form> =
    (form) =>
        <FormBuilder definition={form} />
Template.bind({});

export const Example = Template.bind({});
Example.args = {
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
};








