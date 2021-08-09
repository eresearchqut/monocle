import * as React from "react";
import {InputBooleanCell} from "../../src";
import {Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {initTestStore} from '../../test/testStore';

const path: "booleanCell";
const schema = {
    type: "boolean"
};
const uischema = {
    type: "Control",
    scope: "#/properties/booleanCell",
    options: {
        focus: false,
        input: {
            required: false
        }
    }
};
const data = {
    booleanCell: false
}
const store = initTestStore({
    data,
    schema,
    uischema
});

export default {
    title: 'Cell/Boolean',
    component: InputBooleanCell,
    decorators: [
        (Story) => (
            <Provider store={store}>
                <JsonFormsReduxContext>
                    <Story/>
                </JsonFormsReduxContext>
            </Provider>
        ),
    ],
}


export const Required: React.VFC<{}> = () => <InputBooleanCell path={path} schema={schema} uischema={uischema}/>;


//
// export const Optional = () => Template.bind(baseArgs);
// Template.args = baseArgs;
//
// export const Required = () => Template.bind(baseArgs);
// Template.args = merge(baseArgs, {uischema: {options: {input: {required: true}}}});
