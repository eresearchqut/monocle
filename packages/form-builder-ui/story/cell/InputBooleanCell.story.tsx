import * as React from "react";
import {InputBooleanCell} from "@trrf/form-components";

import {Story, Meta} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {initStore} from '../jsonFormsStore';
import {Input} from "@trrf/form-definition";
import {inputPath, inputSchema, inputUi} from "../utils";


export default {
    title: 'Cell/Boolean',
    component: InputBooleanCell,
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
    <InputBooleanCell
        schema={inputSchema(input)}
        uischema={inputUi(input)}
        id={inputPath(input)}
        path={inputPath(input)}/>;
Template.bind({});

export const BooleanCell = Template.bind({});
BooleanCell.args = {name: 'Yes or No', inputType: 'boolean', required: false};
