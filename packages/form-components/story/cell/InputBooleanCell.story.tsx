import * as React from "react";
import {InputBooleanCell} from "../../src";
import {Story, Meta} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {initTestStore} from '../../test/testStore';
import {JsonSchema, ControlElement, CellProps} from "@jsonforms/core";


const path = "booleanCell"
const schema: JsonSchema = {type: "boolean"}
const uischema: ControlElement = {
    type: "Control",
    scope: "#/properties/booleanCell",
    options: {
        input: {
            required: false
        }
    }
};

export default {
    title: 'Cell/Boolean',
    component: InputBooleanCell,
    argTypes: { onClick: { action: 'handleChange' } },
    decorators: [
        (Story, context) => {
            const {schema, uischema} = context.args;
            const data =  {booleanCell: undefined}
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


// export const Required: React.VFC<{}> = () => <InputBooleanCell path={path} schema={schema} uischema={uischema}/>;

const Template: Story<CellProps> = (props) => <InputBooleanCell {...props} />;

//👇 Each story then reuses that template
export const BooleanCell = Template.bind({});
BooleanCell.args = {path, schema, uischema};