import * as React from "react";
import {InputBooleanCell} from "@trrf/form-components";

import {Story, Meta} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {initStore} from '../jsonFormsStore';
import {Form, Section, Input} from "@trrf/form-definition";
import {findInputBuilder, generatePathFromName} from "@trrf/form-compiler";
import {inputPath, inputSchema, inputUi} from "../utils";


const form: Form = {} as Form;
const section: Section = {} as Section;


export default {
    title: 'Cell/Boolean',
    component: InputBooleanCell,
    decorators: [
        (Story, context) => {
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
