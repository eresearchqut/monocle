import React, {FunctionComponent} from 'react';

import {composePaths, JsonSchema} from "@jsonforms/core";
import startCase from 'lodash/startCase';

const inputSchema = require('../schema/input.json') as JsonSchema;


import {Draggable, DropResult, Droppable, DragDropContext, ResponderProvided} from 'react-beautiful-dnd';

export interface InputSelectorProps {

}

export const InputSelector: FunctionComponent<InputSelectorProps> = ({}) => {


    const onDragEnd = (result: DropResult) => {

    }

    return (

        <div className="p-d-flex p-flex-column">
            <DragDropContext onDragEnd={(result: DropResult, provided: ResponderProvided) => onDragEnd(result)}>
                <Droppable droppableId="inputSelector">
                    {(droppableProvided, snapshot) => (
                        <div ref={droppableProvided.innerRef}
                             {...droppableProvided.droppableProps}>
                            {Object.keys(inputSchema.definitions).map((key, index) =>
                                (
                                    <Draggable
                                        key={key}
                                        draggableId={key}
                                        index={index}>
                                        {(draggableProvided, snapshot) => (
                                            <div ref={draggableProvided.innerRef}
                                                 {...draggableProvided.draggableProps} key={key}
                                                 className="p-mb-2 p-p-2 p-shadow-2">
                                                {startCase(key)}
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
