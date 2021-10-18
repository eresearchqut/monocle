import React, {FunctionComponent} from 'react';

import startCase from 'lodash/startCase';
import {Draggable, Droppable} from 'react-beautiful-dnd';
import {InputType, SectionType} from "@trrf/form-definition";
import ComponentIcon from "./ComponentIcon";

export const ComponentSelector: FunctionComponent = () => {


    const title = (inputType: InputType) => startCase(inputType || '');

    return (
        <React.Fragment>
            <div className='section-selector'>
                <Droppable droppableId="sectionSelector" type="sections" isDropDisabled={true}>
                    {(droppableProvided, snapshot) => (
                        <div
                            className="p-d-flex p-flex-column"
                            ref={droppableProvided.innerRef}>
                            <Draggable

                                draggableId='section'
                                index={0}>
                                {(draggableProvided, snapshot) => (
                                    <React.Fragment>
                                        <div ref={draggableProvided.innerRef}
                                             {...draggableProvided.draggableProps}
                                             {...draggableProvided.dragHandleProps}
                                             className={`p-mb-2 p-p-2 p-shadow-2 ${snapshot.isDragging ? 'input-dragging' : ''}`}>
                                            <ComponentIcon componentType={SectionType.DEFAULT} />
                                            <span className={'p-text-nowrap'}>Section</span>
                                        </div>
                                        {snapshot.isDragging && (
                                            <div
                                                className="p-mb-2 p-p-2 p-shadow-2 input-clone">
                                                <ComponentIcon componentType={SectionType.DEFAULT} />
                                                <span className={'p-text-nowrap'}>Section</span>
                                            </div>
                                        )}
                                    </React.Fragment>
                                )}
                            </Draggable>
                        </div>
                    )}
                </Droppable>

            </div>


            <div className='input-selector'>
                <Droppable droppableId="inputSelector" type="inputs" isDropDisabled={true}>
                    {(droppableProvided, snapshot) => (
                        <div
                            className="p-d-flex p-flex-column"
                            ref={droppableProvided.innerRef}>
                            {Object.values(InputType).map((inputType, index) => // @ts-ignore
                                (
                                    <Draggable
                                        key={inputType}
                                        draggableId={inputType}
                                        index={index}>
                                        {(draggableProvided, snapshot) => (
                                            <React.Fragment>
                                                <div ref={draggableProvided.innerRef}
                                                     {...draggableProvided.draggableProps}
                                                     {...draggableProvided.dragHandleProps}
                                                     className={`p-mb-2 p-p-2 p-shadow-2 ${snapshot.isDragging ? 'input-dragging' : ''}`}>
                                                    <ComponentIcon componentType={inputType} />
                                                    <span className={'p-text-nowrap'}>{title(inputType)}</span>
                                                </div>
                                                {snapshot.isDragging && (
                                                    <div
                                                        className="p-mb-2 p-p-2 p-shadow-2 input-clone">
                                                        <ComponentIcon componentType={inputType} />
                                                        <span className={'p-text-nowrap'}>{title(inputType)}</span>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        )}
                                    </Draggable>
                                )
                            )}
                        </div>
                    )}
                </Droppable>

            </div>
        </React.Fragment>
    );
};
