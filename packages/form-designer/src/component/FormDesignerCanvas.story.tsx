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
    definition: {
        name: 'Muscular Atrophy',
        sections: [
            {
                id: 'eefaf721-dacd-407d-8a06-2efc1dcd3ed7',
                name: 'Patient Details',
                type: 'default',
                inputs: [
                    {
                        id: 'fba2b164-1a8d-4fa2-9483-6e062eb71d64',
                        type: 'text',
                        minLength: 100,
                        maxLength: 200,
                        name: 'Patient name',
                        description: 'First, Middle, Last',
                        required: true,
                    },
                    {
                        id: '5b701630-62e7-4b97-8b99-cb5e4143393a',
                        type: 'date',
                        required: true,
                        name: 'Visit date',
                    }
                ],
            },
            {
                id: '29a54c4c-c860-45d8-ab45-039cd27d49a0',
                name: 'Assessment',
                type: 'default',
                inputs: [
                    {
                        id: 'e1a3e824-122c-4e28-9afa-94a9f302db43',
                        type: 'text',
                        name: 'Notes',
                        description: 'Clinician notes',
                        multiline: true,
                        required: false,
                    },
                    {
                        id: '0c1c1dd0-a48d-4a73-8399-0124f054f2ee',
                        type: 'currency',
                        name: 'Pathology charges',
                        description: 'Pathology charges associated with this visit',
                        currencyCode: 'AUD',
                        currencyDisplay: 'symbol',
                        required: false,
                    },
                    {
                        id: '17a08acb-9291-48f5-96d3-eda2689ecf8e',
                        type: 'boolean',
                        name: 'Is the patient experiencing marked weakness in one or more limb?',
                        required: false,
                    },
                    {
                        id: '77f37476-5619-44a3-9bc5-ab7e83f4180e',
                        type: 'boolean',
                        required: true,
                        name: 'Has there been degradation since last visit?',
                    },
                    {
                        id: '1337be1d-36e2-408b-8ebf-82320cf2f38a',
                        type: 'svg-map',
                        multiselect: true,
                        map: 'body',
                        name: 'Muscles showing marked weakness',
                        description: 'Multiple can be picked',
                        required: false,
                    },
                ],
            },
        ],
    },
};


