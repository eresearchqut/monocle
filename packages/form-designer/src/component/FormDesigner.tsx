import React, { FunctionComponent, useState } from 'react';
import { FormDesignerCanvas } from './FormDesignerCanvas';
import { FormPreview } from './FormPreview';
import { JsonFormsCore } from '@jsonforms/core';
import ComponentSelector from './ComponentSelector';

import { Form, Input, InputType, Section, SectionType } from '@eresearchqut/form-definition';

import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';

export interface FormDesignerProps {
    definition: Form;
    data?: any;
    locale?: string;

    onDefinitionChange?(state: Pick<JsonFormsCore, 'data' | 'errors'>): void;

    onDataChange?(state: Pick<JsonFormsCore, 'data' | 'errors'>): void;
}

export const FormDesigner: FunctionComponent<FormDesignerProps> = ({
                                                                       definition,
                                                                       data,
                                                                       onDefinitionChange,
                                                                       onDataChange,
                                                                       locale,
                                                                   }) => {
    const [formDefinition, setFormDefinition] = useState<Form>(definition);

    const [formData, setFormData] = useState<any>(data);

    const handleDefinitionChange = (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
        const definition = state.data as Form;
        setFormDefinition(() => definition);
        if (onDefinitionChange) {
            onDefinitionChange(state);
        }
    };

    const handleDataChange = (state: Pick<JsonFormsCore, 'data' | 'errors'>) => {
        const { data } = state;
        setFormData(() => data);
        if (onDataChange) {
            onDataChange(state);
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { draggableId, source, destination, type } = result;
        if (destination) {
            setFormDefinition((currentState) => {
                const definition = JSON.parse(JSON.stringify(currentState));
                if (type === 'sections') {
                    if (result.source.droppableId === 'sectionSelector') {
                        const section = { id: uuidv4(), type: SectionType.DEFAULT, inputs: [] };
                        definition.sections.splice(destination.index || 0, 0, section);
                    } else if (destination) {
                        const index = definition.sections.findIndex(
                            (section: Section) => section.id === result.draggableId,
                        );
                        const moving = definition.sections[index];
                        definition.sections.splice(index, 1);
                        definition.sections.splice(destination.index || 0, 0, moving);
                    }
                }
                if (type === 'inputs') {
                    const destinationSectionIndex = parseInt(result.destination?.droppableId.split('.')[1] || '0');
                    const destinationSection = definition.sections[destinationSectionIndex];
                    if (result.source.droppableId === 'inputSelector') {
                        const type = result.draggableId;
                        const input =
                            type === InputType.OPTIONS
                                ? {
                                    type,
                                    name: '',
                                    id: uuidv4(),
                                    optionValueType: 'string',
                                    options: [],
                                }
                                : {
                                    type,
                                    name: '',
                                    id: uuidv4(),
                                };
                        destinationSection.inputs.splice(destination.index || 0, 0, input);
                    } else if (destination) {
                        const sourceSectionIndex = parseInt(source?.droppableId.split('.')[1] || '0');
                        const sourceSection = definition.sections[sourceSectionIndex];
                        const [moving] = definition.sections[sourceSectionIndex].inputs.filter(
                            (input: Input) => input.id === draggableId,
                        );

                        sourceSection.inputs.splice(source.index, 1);
                        destinationSection.inputs.splice(destination.index || 0, 0, moving);
                    }
                }
                return definition;
            });
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className='p-d-flex form-designer' id='form-designer'>
                <div className='p-mr-4'>
                    {/*<Sticky enableTransforms={false}>*/}
                    <ComponentSelector componentTypes={Object.values(InputType)} />
                    {/*</Sticky>*/}
                </div>
                <div className='p-mr-4'>
                    <FormDesignerCanvas definition={formDefinition} onChange={handleDefinitionChange} locale={locale} />
                </div>
                <div>
                    <FormPreview
                        definition={formDefinition}
                        data={formData}
                        onChange={handleDataChange}
                        locale={locale}
                    />
                </div>
            </div>
        </DragDropContext>
    );
};
