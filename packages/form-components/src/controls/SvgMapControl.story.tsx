import * as React from "react";

import {Meta, Story} from '@storybook/react';
import {JsonFormsReduxContext} from '@jsonforms/react/lib/redux';
import {Provider} from 'react-redux';
import {ControlProps} from "@jsonforms/core";
import SvgMapControl from "./SvgMapControl";

import {initStoryStore} from "../storyStore";
import {cells, renderers} from "../index";
import {Card} from "primereact/card";

export default {
    title: 'Control/SvgMapControl',
    component: SvgMapControl,
    decorators: [
        (Story, context) => {
            const {schema, uischema, data, path} = context.args as ControlProps;
            const store = initStoryStore({
                    data: {[path]: data}, schema, uischema,
                    renderers, cells
                },
            );
            return (
                <Provider store={store}>
                    <JsonFormsReduxContext>

                            <Story/>

                    </JsonFormsReduxContext>
                </Provider>
            )
        },

    ]
} as Meta;

const Template: Story<ControlProps> =
    (props) =>
        <SvgMapControl schema={props.schema} uischema={props.uischema}/>
Template.bind({});

export const Body = Template.bind({});
Body.args = {
    data: true,
    path: 'control',
    schema: {
        properties: {
            body: {
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        }
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/control',
        options: {
            map: 'body',
            multiselect: true
        }
    }
};

