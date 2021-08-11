import * as React from "react";
import {cells, renderers} from "@trrf/form-components";
import {Story, Meta} from '@storybook/react';
import {BooleanInput, DateInput, Input, NumericInput, TextInput} from "@trrf/form-definition";
import {cellSchema, path, ui, initStore} from "../utils";
import {DispatchCell, JsonFormsStateProvider} from "@jsonforms/react";

export default {
    title: 'Cells',
    component: DispatchCell,
    argTypes: {
        name: {
            control: {
                type: null
            }
        },
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
            const core = initStore(cellSchema(input), ui(input), data);
            return (
                <JsonFormsStateProvider initState={{ renderers: renderers, cells: cells, core }}>
                    <Story/>
                </JsonFormsStateProvider>
            )
        }
    ],
} as Meta;


const Template: Story<Input> = (input) =>
    <DispatchCell
        schema={cellSchema(input)}
        uischema={ui(input)}
        path={path(input)}
        cells={cells}
    />

Template.bind({});

export const BooleanCell = Template.bind({});
BooleanCell.args = {name: 'Yes or No', inputType: 'boolean', required: false} as BooleanInput;

export const DateCell = Template.bind({});
DateCell.args = {name: 'When', inputType: 'date', required: false} as DateInput;

export const TextCell = Template.bind({});
TextCell.args = {name: 'Show me the text', inputType: 'text', required: false, multiline: false} as TextInput;

export const NumericCell = Template.bind({});
NumericCell.args = {name: 'Show me the numbers', inputType: 'numeric', required: false, decimalPlaces: 4, minimum: 0, maximum: 10000, groupNumbers: false} as NumericInput;
