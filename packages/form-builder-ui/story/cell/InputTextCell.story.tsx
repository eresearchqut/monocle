import * as React from "react";
import {InputTextCell} from  "@trrf/form-components";
import {Story, Meta} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {initStore} from '../jsonFormsStore';
import {JsonSchema, ControlElement, CellProps} from "@jsonforms/core";


const path = "textCell"
const schema: JsonSchema = {type: "string"}
const uischema: ControlElement = {
    type: "Control",
    scope: "#/properties/textCell",
    options: {
        input: {
            required: true
        }
    }
};

export default {
    title: 'Cell/Text',
    component: InputTextCell,
    decorators: [
        (Story, context) => {
            const {schema, uischema} = context.args;
            const data =  {textCell: undefined};
            const store = initStore({
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


const Template: Story<CellProps> = (props) => <InputTextCell {...props} />;

export const TextCell = Template.bind({});
TextCell.args = {path, schema, uischema};


