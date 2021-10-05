import React, {FunctionComponent, useState, useEffect} from 'react';
import {FormCanvas} from './FormCanvas';
import {FormPreview} from './FormPreview';
import {InputSelector} from './InputSelector';

import {Form} from '../../../form-definition';
import {Card} from 'primereact/card';
import {ErrorObject} from 'ajv';
import {DragDropContext, DropResult, ResponderProvided} from "react-beautiful-dnd";


export interface FormDesignerProps {
    definition: Form;
    data?: any;

    onDefinitionChange?(state: { errors?: ErrorObject[], data: any }): void;

    onDataChange?(state: { errors?: ErrorObject[], data: any }): void;
}

export const FormDesigner: FunctionComponent<FormDesignerProps> = (props) => {
    const [formDesignerState, setFormDesignerState] = useState<FormDesignerProps>(props);


    const handleDefinitionChange = (state: { errors?: ErrorObject[], data: any }) => {
        setFormDesignerState((prevState) => ({...prevState, definition: state.data}));
        if (formDesignerState.onDefinitionChange) {
            formDesignerState.onDefinitionChange(state);
        }
    };

    const handleDataChange = (state: { errors?: ErrorObject[], data: any }) => {
        setFormDesignerState((prevState) => ({...prevState, data: state.data}));
        if (formDesignerState.onDataChange) {
            formDesignerState.onDataChange(state);
        }
    };


    const onDragEnd = (result: DropResult) => {

        if (result.type === 'inputs') {
            const destinationSection = parseInt(result.destination?.droppableId.split('.')[1] || '0');
            if (result.source.droppableId === 'inputSelector') {
                console.log('Adding Input', 'destination section', destinationSection, result);
            } else if (result.destination) {
                const sourceSection = parseInt(result.source?.droppableId.split('.')[1] || '0');
                setFormDesignerState((prevState) => {
                    const definition = {...prevState.definition};
                    const element = definition.sections[sourceSection].inputs.splice(result.source.index, 1)[0];
                    definition.sections[destinationSection].inputs.splice(result.destination?.index || 0, 0, element);
                    console.log('Moving Input', 'sourceSection', sourceSection, 'destination section', destinationSection, definition);
                    return {...prevState, definition};
                })
            }
        }
    };

    return (

        <DragDropContext onDragEnd={onDragEnd}>

            <div className="p-grid">
                <div className="p-col-12 p-md-2">
                    <InputSelector/>
                </div>
                <div className="p-col-12 p-md-6">
                    <FormCanvas definition={formDesignerState.definition} onChange={handleDefinitionChange}/>
                </div>
                <div className="p-col-12 p-md-4">
                    <FormPreview definition={formDesignerState.definition} data={formDesignerState.data}
                                 onChange={handleDataChange}/>
                </div>
            </div>

        </DragDropContext>
    );
};
