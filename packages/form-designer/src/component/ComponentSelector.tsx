import React, {FunctionComponent} from 'react';

import {Draggable, Droppable} from 'react-beautiful-dnd';
import {InputType, SectionType} from "@trrf/form-definition";
import Component, {ComponentProps} from "./Component";

import './component-selector.scss';

export interface ComponentDraggableProps extends ComponentProps {
    index: number;
}


const ComponentDraggable: FunctionComponent<ComponentDraggableProps> = ({componentType, index}) => <Draggable
    key={componentType}
    draggableId={componentType}
    index={index}>
    {(draggableProvided, snapshot) => (
        <React.Fragment>
            <div ref={draggableProvided.innerRef}
                 {...draggableProvided.draggableProps}
                 {...draggableProvided.dragHandleProps}
                 className={'component-selector-dragging p-d-inline-flex'}>
                <Component componentType={componentType}/>
            </div>
            {snapshot.isDragging && (
                <div
                    className={`${snapshot.isDragging ? 'component-selector-dragging p-d-inline-flex' : 'component-selector-clone p-d-inline-flex'}`}>
                    <Component componentType={componentType}/>
                </div>
            )}
        </React.Fragment>
    )}
</Draggable>

export interface ComponentSelectorProps  {
    componentTypes: Array<InputType|SectionType>
}

export const ComponentSelector: FunctionComponent<ComponentSelectorProps> = ({componentTypes}) => {


    return (

        <div className={'component-selector'}>

            {/*<Droppable droppableId="sectionSelector" type="sections" isDropDisabled={true}>*/}
            {/*    {(droppableProvided, snapshot) => (*/}
            {/*        <div*/}
            {/*            className="p-d-flex"*/}
            {/*            ref={droppableProvided.innerRef}>*/}
            {/*            <Draggable*/}
            {/*                draggableId='section'*/}
            {/*                index={0}>*/}
            {/*                {(draggableProvided, snapshot) => (*/}
            {/*                    <React.Fragment>*/}
            {/*                        <div ref={draggableProvided.innerRef}*/}
            {/*                             {...draggableProvided.draggableProps}*/}
            {/*                             {...draggableProvided.dragHandleProps}*/}
            {/*                             className={`${snapshot.isDragging ? 'input-dragging' : ''}`}>*/}
            {/*                            <Component componentType={SectionType.DEFAULT} />*/}
            {/*                        </div>*/}
            {/*                        {snapshot.isDragging && (*/}
            {/*                            <div*/}
            {/*                                className="input-clone">*/}
            {/*                                <Component componentType={SectionType.DEFAULT} />*/}
            {/*                            </div>*/}
            {/*                        )}*/}
            {/*                    </React.Fragment>*/}
            {/*                )}*/}
            {/*            </Draggable>*/}
            {/*        </div>*/}
            {/*    )}*/}
            {/*</Droppable>*/}


            <Droppable droppableId="inputSelector" type="inputs" isDropDisabled={true} isCombineEnabled={false}>
                {(droppableProvided, snapshot) => (
                    <React.Fragment>
                        <div className='component-selector'
                             ref={droppableProvided.innerRef}>
                            {componentTypes.map((componentType, index) => ComponentDraggable({componentType: componentType, index}))}
                        </div>
                        {droppableProvided.placeholder}
                    </React.Fragment>
                )}
            </Droppable>

        </div>
    );
};
