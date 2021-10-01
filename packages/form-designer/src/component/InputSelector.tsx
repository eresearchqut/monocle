import React, {FunctionComponent} from 'react';

import {JsonSchema} from '@jsonforms/core';
import startCase from 'lodash/startCase';

const inputSchema = require('../schema/input.json') as JsonSchema;


import {Draggable, DropResult, Droppable, DragDropContext, ResponderProvided} from 'react-beautiful-dnd';
import {Avatar} from 'primereact/avatar';


export interface InputSelectorProps {

}

export const InputSelector: FunctionComponent<InputSelectorProps> = ({}) => {
    const onDragEnd = (result: DropResult) => {

    };


    const iconMap: Map<string, string> = new Map<string, string>([
        ['DateInput', 'pi-calendar'],
        ['BooleanInput', 'pi-check-square'],
        ['TextInput', 'pi-align-left'],
        ['SvgMapInput', 'pi-image'],
        ['NumericInput', 'pi-sort-numeric-up'],
        ['CurrencyInput', 'pi-money-bill']
    ]);

    return (

        <div className="p-d-flex p-flex-column">
            <DragDropContext onDragEnd={(result: DropResult, provided: ResponderProvided) => onDragEnd(result)}>
                <Droppable droppableId="inputSelector">
                    {(droppableProvided, snapshot) => (
                        <div ref={droppableProvided.innerRef}
                             {...droppableProvided.droppableProps}>
                            {Object.entries(inputSchema.definitions).map(([key, definition], index) =>
                                (
                                    <Draggable
                                        key={key}
                                        draggableId={key}
                                        index={index}>
                                        {(draggableProvided, snapshot) => (
                                            <div ref={draggableProvided.innerRef}
                                                 {...draggableProvided.draggableProps}
                                                 {...draggableProvided.dragHandleProps}
                                                 key={key}
                                                 className="p-mb-2 p-p-2 p-shadow-2 ">
                                                <Avatar icon={`pi ${iconMap.get(key)}`} className="p-mr-2"
                                                        shape="circle"/>

                                                <span className={'p-text-nowrap'}>{startCase(definition.title)}</span>
                                            </div>
                                        )}

                                    </Draggable>
                                )
                            )}
                            {droppableProvided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>


    );
};
