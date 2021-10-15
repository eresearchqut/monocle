import React, {FunctionComponent} from 'react';

import {JsonSchema} from '@jsonforms/core';
import startCase from 'lodash/startCase';

const inputSchema = require('../schema/input.json') as JsonSchema;


import {Draggable, Droppable} from 'react-beautiful-dnd';
import {Avatar} from 'primereact/avatar';

export const ComponentSelector: FunctionComponent = () => {

    const iconMap: Map<string, string> = new Map<string, string>([
        ['DateInput', 'pi-calendar'],
        ['BooleanInput', 'pi-check-square'],
        ['MultilineTextInput', 'pi-align-left'],
        ['TextInput', 'pi-ellipsis-h'],
        ['SvgMapInput', 'pi-image'],
        ['NumericInput', 'pi-sort-numeric-up'],
        ['CurrencyInput', 'pi-money-bill'],
        ['RangeInput', 'pi-sliders-h']

    ]);

    const title = (definition: any) => startCase(definition?.title || '');

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
                                            <Avatar icon='pi pi-bars' className="p-mr-2"
                                                    shape="circle"/>
                                            <span className={'p-text-nowrap'}>Section</span>
                                        </div>
                                        {snapshot.isDragging && (
                                            <div
                                                className="p-mb-2 p-p-2 p-shadow-2 input-clone">
                                                <Avatar icon='pi pi-bars' className="p-mr-2"
                                                        shape="circle"/>
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
                            {Object.entries(inputSchema.definitions as { [s: string]: JsonSchema }).map(([key, definition], index) => // @ts-ignore
                                (
                                    <Draggable
                                        key={key}
                                        draggableId={key}
                                        index={index}>
                                        {(draggableProvided, snapshot) => (
                                            <React.Fragment>
                                                <div ref={draggableProvided.innerRef}
                                                     {...draggableProvided.draggableProps}
                                                     {...draggableProvided.dragHandleProps}
                                                     className={`p-mb-2 p-p-2 p-shadow-2 ${snapshot.isDragging ? 'input-dragging' : ''}`}>
                                                    <Avatar icon={`pi ${iconMap.get(key)}`} className="p-mr-2"
                                                            shape="circle"/>
                                                    <span className={'p-text-nowrap'}>{title(definition)}</span>
                                                </div>
                                                {snapshot.isDragging && (
                                                    <div
                                                        className="p-mb-2 p-p-2 p-shadow-2 input-clone">
                                                        <Avatar icon={`pi ${iconMap.get(key)}`} className="p-mr-2"
                                                                shape="circle"/>
                                                        <span className={'p-text-nowrap'}>{title(definition)}</span>
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
