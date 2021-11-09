import * as React from 'react';

import { Meta, Story } from '@storybook/react';
import ComponentSelector, { ComponentSelectorProps } from './ComponentSelector';
import { DragDropContext, DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { InputType, SectionType } from '@eresearchqut/form-definition';

export default {
    title: 'Component/ComponentSelector',
    component: ComponentSelector,
    decorators: [
        (Story, context) => {
            return (
                <DragDropContext onDragEnd={(result: DropResult, provided: ResponderProvided) => console.log(result)}>
                    <Story />
                </DragDropContext>
            );
        },
    ],
} as Meta;

const Template: Story<ComponentSelectorProps> = (props) => <ComponentSelector {...props} />;
Template.bind({});

export const InputTypeComponents = Template.bind({});
InputTypeComponents.args = { componentTypes: Object.values(InputType) };

export const SectionTypeComponents = Template.bind({});
SectionTypeComponents.args = { componentTypes: Object.values(SectionType) };
