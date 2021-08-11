import * as React from "react";
import {cells, InputControl, renderers, VerticalLayout} from "@trrf/form-components";

import {Story, Meta} from '@storybook/react';
import {BooleanInput, Input, NumericInput, TextInput} from "@trrf/form-definition";
import {controlSchema, initStore, ui} from "../utils";
import { JsonFormsStateProvider } from '@jsonforms/react';



export default {
    title: 'Controls',
    component: InputControl,
    argTypes: {
        inputType: {
            control: {
                type: null
            }
        }
    },
    decorators: [
        (Story, context) => {
            const input = context.args as Input;
            const data = {};
            const core = initStore(controlSchema(input), ui(input), data);
            return (
                <JsonFormsStateProvider initState={{ renderers: renderers, cells: cells, core }}>
                    <Story/>
                </JsonFormsStateProvider>
            )
        }
    ],
} as Meta;


const Template: Story<Input> = (input) => <InputControl schema={controlSchema(input)} uischema={ui(input)}/>
Template.bind({});

export const BooleanControl = Template.bind({});
BooleanControl.args = {name: 'Yes or No', inputType: 'boolean', required: false} as BooleanInput;

export const TextControl = Template.bind({});
TextControl.args = {name: 'Show me the text', inputType: 'text', required: false, multiline: false} as TextInput;

export const NumericControl = Template.bind({});
NumericControl.args = {name: 'Show me the numbers', inputType: 'numeric', required: false, decimalPlaces: 4, minimum: 0, maximum: 10000, groupNumbers: false} as NumericInput;