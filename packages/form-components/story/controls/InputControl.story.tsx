import * as React from "react";
import {InputControl, cells, renderers} from "../../src";
import {Story, Meta} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {initTestStore} from '../../test/testStore';
import {JsonSchema, ControlElement, CellProps} from "@jsonforms/core";

const path = "textCell"
const schema: JsonSchema = {type: "string"}
const uischema: ControlElement = {
    type: "Control",
    scope: "#/properties/textCell",
    options: {
        input: {
            inputType: "text",
            required: true
        }
    }
};

export default {
    title: 'Input/Control',
    component: InputControl,
    decorators: [
        (Story, context) => {
            const {schema, uischema} = context.args;
            const data =  {textCell: undefined};
            const store = initTestStore({
                    data,
                    schema,
                    uischema
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


const Template: Story<CellProps> = (props) => <InputControl {...props} />;

export const TextControl = Template.bind({});
TextControl.args = {path, schema, uischema, cells, renderers};


