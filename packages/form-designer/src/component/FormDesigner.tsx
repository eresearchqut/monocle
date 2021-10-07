import React, {FunctionComponent, useState, useEffect} from 'react';
import {FormDesignerCanvas} from './FormDesignerCanvas';
import {FormPreview} from './FormPreview';
import {InputSelector} from './InputSelector';

import {Form, Input} from '@trrf/form-definition';
import {ErrorObject} from 'ajv';
import {DragDropContext, DropResult} from "react-beautiful-dnd";


export interface FormDesignerProps {
    definition: Form;
    data?: any;

    onDefinitionChange?(state: { errors?: ErrorObject[], data: any }): void;

    onDataChange?(state: { errors?: ErrorObject[], data: any }): void;
}

export const FormDesigner: FunctionComponent<FormDesignerProps> = (props) => {

    const [state, setState] = useState<FormDesignerProps>(props);


    const handleDefinitionChange = (state: { errors?: ErrorObject[], data: any }) => {
        const definition = state.data as Form;
        setState((currentState) => ({...currentState, definition}));
        // if (onDefinitionChange) {
        //     onDefinitionChange(state);
        // }
    };


    const handleDataChange = (state: { errors?: ErrorObject[], data: any }) => {
        // const {data} = state;
        // setState((currentState) => ({...currentState, data}));
        // // if (formDesignerState.onDataChange) {
        // //     formDesignerState.onDataChange(state);
        // // }
    };


    const onDragEnd = (result: DropResult) => {

        const {draggableId, source, destination, type} = result;


        setState((currentState) => {


            const definition = JSON.parse(JSON.stringify(currentState.definition));
            if (type === 'inputs') {

                const destinationSectionIndex = parseInt(result.destination?.droppableId.split('.')[1] || '0');
                const destinationSection = definition.sections[destinationSectionIndex];

                if (result.source.droppableId === 'inputSelector') {
                    console.log('Adding Input', 'destination section', destinationSection, result);
                } else if (destination) {
                    const sourceSectionIndex = parseInt(source?.droppableId.split('.')[1] || '0');
                    const sourceSection = definition.sections[sourceSectionIndex];
                    const [moving] = definition
                        .sections[sourceSectionIndex]
                        .inputs.filter((input: Input) => input.id === draggableId);

                    sourceSection.inputs.splice(source.index, 1);
                    destinationSection.inputs.splice(destination.index || 0, 0, moving);

                    console.log('Moving Input', draggableId, 'sourceSection',
                        sourceSectionIndex, source.index, 'destination section',
                        destinationSectionIndex, destination.index, definition);

                }
            }
            return {...currentState, definition};
        })

    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="p-grid form-designer">
                <div className="p-col-12 p-md-2">
                    <InputSelector/>
                </div>
                <div className="p-col-12 p-md-6">
                    <FormDesignerCanvas definition={state.definition} onChange={handleDefinitionChange}/>
                </div>
                <div className="p-col-12 p-md-4">
                    <FormPreview definition={state.definition} data={state.data} onChange={handleDataChange}/>
                </div>
            </div>
        </DragDropContext>
    );
};
