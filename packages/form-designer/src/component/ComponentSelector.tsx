import React, {FunctionComponent} from 'react';

import {Draggable, Droppable} from 'react-beautiful-dnd';
import {InputType, SectionType} from "@trrf/form-definition";
import Component from "./Component";

import './component-selector.scss';

export interface ComponentSelectorProps {
    componentTypes: Array<InputType | SectionType>
}

const ComponentSelector: FunctionComponent<ComponentSelectorProps> = ({componentTypes}) => {
    return (


            <Droppable droppableId="inputSelector" type="inputs" isDropDisabled={true} >
                {(droppableProvided, snapshot) => (
                    <div ref={droppableProvided.innerRef}>
                        {componentTypes.map((componentType, index) =>
                            <Draggable
                                key={componentType}
                                draggableId={componentType}
                                index={index}>
                                {(draggableProvided, snapshot) => (
                                    <React.Fragment>
                                        <Component draggableProvided={draggableProvided} componentType={componentType}/>
                                        {snapshot.isDragging && (
                                            <Component componentType={componentType}/>
                                        )}
                                    </React.Fragment>
                                )}
                            </Draggable>
                        )}
                        {droppableProvided.placeholder}
                    </div>
                )}
            </Droppable>

    );
};

export default ComponentSelector;
