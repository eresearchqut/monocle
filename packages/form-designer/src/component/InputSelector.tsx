import React, {FunctionComponent} from 'react';

import {JsonSchema} from '@jsonforms/core';
import startCase from 'lodash/startCase';

const inputSchema = require('../schema/input.json') as JsonSchema;


import {Draggable, Droppable} from 'react-beautiful-dnd';
import {Avatar} from 'primereact/avatar';


export interface InputSelectorProps {

}

export const InputSelector: FunctionComponent<InputSelectorProps> = ({}) => {

    const iconMap: Map<string, string> = new Map<string, string>([
        ['DateInput', 'pi-calendar'],
        ['BooleanInput', 'pi-check-square'],
        ['TextInput', 'pi-align-left'],
        ['SvgMapInput', 'pi-image'],
        ['NumericInput', 'pi-sort-numeric-up'],
        ['CurrencyInput', 'pi-money-bill']
    ]);

    const title = (definition: any) => startCase(definition?.title || '');

    return (
        <div className="p-d-flex p-flex-column input-selector">
            <Droppable droppableId="inputSelector" type="inputs">
                {(droppableProvided, snapshot) => (
                    <div ref={droppableProvided.innerRef}{...droppableProvided.droppableProps}>
                        {Object.entries(inputSchema.definitions as { [s: string]: JsonSchema }).map(([key, definition], index) => // @ts-ignore
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
                                            <span className={'p-text-nowrap'}>{title(definition)}</span>
                                        </div>
                                    )}
                                </Draggable>
                            )
                        )}
                        {droppableProvided.placeholder}
                    </div>
                )}
            </Droppable>

        </div>
    );
};
