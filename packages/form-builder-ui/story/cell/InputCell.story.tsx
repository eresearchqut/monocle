import * as React from "react";
import {cells} from "@trrf/form-components";

import {Story, Meta} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {initStore} from '../jsonFormsStore';
import {Input} from "@trrf/form-definition";
import {inputPath, inputSchema, inputUi} from "../utils";
import {DispatchCell} from "@jsonforms/react";

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
            console.log(context);
            const input = context.args as Input;
            const data = {};
            data [inputPath(input)] = undefined;
            const store = initStore({
                    data,
                    schema: inputSchema(input),
                    uischema: inputUi(input)
                }
            );
            return (
                <Provider store={store}>
                    <JsonFormsReduxContext>
                        <Story/>
                    </JsonFormsReduxContext>
                </Provider>
            )
        }
    ],
} as Meta;


const Template: Story<Input> = (input) =>
    <DispatchCell
        schema={inputSchema(input)}
        uischema={inputUi(input)}
        id={inputPath(input)}
        path={inputPath(input)}
        cells={cells}
    />

Template.bind({});

export const BooleanCell = Template.bind({});
BooleanCell.args = {name: 'Yes or No', inputType: 'boolean', required: false};

export const TextCell = Template.bind({});
TextCell.args = {name: 'Show me the text', inputType: 'text', required: false, multiline: false};

export const NumericCell = Template.bind({});
NumericCell.args = {name: 'Show me the numbers', inputType: 'numeric', required: false};
