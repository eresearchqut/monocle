import * as React from 'react';

import {Meta, Story} from '@storybook/react';
import {ComponentSelector} from './ComponentSelector';
import {DragDropContext, DropResult, ResponderProvided} from "react-beautiful-dnd";

export default {
    title: 'Component/ComponentSelector',
    component: ComponentSelector,
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
        <ComponentSelector {...props} />;
Template.bind({});

export const Example = Template.bind({});
Example.args = {};


