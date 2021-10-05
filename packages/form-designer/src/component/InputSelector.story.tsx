import * as React from 'react';

import {Meta, Story} from '@storybook/react';
import {InputSelector, InputSelectorProps} from './InputSelector';
import {DragDropContext, Droppable, DropResult, ResponderProvided} from "react-beautiful-dnd";

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

const Template: Story<InputSelectorProps> =
    (props) =>
        <InputSelector {...props} />;
Template.bind({});

export const Example = Template.bind({});
Example.args = {};


