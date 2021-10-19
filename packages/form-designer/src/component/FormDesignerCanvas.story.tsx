import * as React from 'react';

import {Meta, Story} from '@storybook/react';
import {FormDesignerCanvas, FormCanvasProps} from './FormDesignerCanvas';
import {DragDropContext, DropResult, ResponderProvided} from "react-beautiful-dnd";

export default {
    title: 'Component/FormDesignerCanvas',
    component: FormDesignerCanvas,
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

const Template: Story<FormCanvasProps> =
    ({definition}) =>
        <FormDesignerCanvas definition={definition}/>;
Template.bind({});

export const Example = Template.bind({});
Example.args = {
    definition: require('./definition.story.json'),
    locale: 'en-AU'
};


