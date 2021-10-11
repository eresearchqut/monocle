import * as React from 'react';

import {Meta, Story} from '@storybook/react';
import {InputSelector} from './InputSelector';
import {DragDropContext, DropResult, ResponderProvided} from "react-beautiful-dnd";

export default {
    title: 'Component/InputSelector',
    component: InputSelector,
    decorators: [
        (Story, context) => {
            return (
                <DragDropContext onDragEnd={(result: DropResult, provided: ResponderProvided) => console.log(result)}>
                    <Story/>
                </DragDropContext>
            )
        },
    ]
} as Meta;

const Template: Story =
    (props) =>
        <InputSelector {...props} />;
Template.bind({});

export const Example = Template.bind({});
Example.args = {};


