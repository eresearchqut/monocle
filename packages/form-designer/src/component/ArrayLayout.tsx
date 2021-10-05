import React, {FunctionComponent, useCallback, useEffect, useState} from 'react';
import {
    ArrayLayoutProps, composePaths,
    isObjectArrayWithNesting,
    RankedTester,
    rankWith, Resolve,
    update,
} from '@jsonforms/core';
import {
    JsonFormsStateContext,
    useJsonForms,
    withJsonFormsArrayLayoutProps,
} from '@jsonforms/react';
import ArrayItemRenderer from './ArrayItemRenderer';

import {Droppable, Draggable} from 'react-beautiful-dnd';


export const ArrayLayout: FunctionComponent<ArrayLayoutProps> = ({
                                                                     id,
                                                                     data,
                                                                     path,
                                                                     schema,
                                                                     uischema,
                                                                     renderers,
                                                                     cells,
                                                                     rootSchema,
                                                                     config,
                                                                     uischemas,
                                                                 }) => {

    const context: JsonFormsStateContext = useJsonForms();
    const {dispatch} = context;

    const startCollapsed = uischema.scope === '#/properties/inputs';


    const [collapsed, setCollapsed] = useState<boolean[]>([]);

    useEffect(() => {
        setCollapsed(() => new Array(data).fill(startCollapsed));
    }, [data]);

    const arrayMove = (arr: any[], fromIndex: number, toIndex: number) => {
        const element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    };

    const handleToggle = (index: number) => (event: any): void => {
        setCollapsed((currentState) => {
            const currentCollapse = currentState[index];
            currentState[index] = !currentCollapse;
            return currentState;
        });
        if (dispatch) {
            dispatch(
                update(path, (array) => array),
            );
        }
    };

    const remove = (index: number) => (event: any): void => {
        setCollapsed((currentState) => {
            currentState.splice(index, 1);
            return currentState;
        });
        if (dispatch) {
            dispatch(
                update(path, (array) => {
                    array.splice(index, 1);
                    return array;
                }),
            );
        }
    };

    const move = (from: number, to: number) => {
        if (context.dispatch) {
            // Move the collapsed state of the item
            setCollapsed((currentState) => {
                arrayMove(currentState, from, to);
                return currentState;
            });
            // Then move the value in the array
            context.dispatch(
                update(path, (array) => {
                    arrayMove(array, from, to);
                    return array;
                }),
            );
        }
    };

    const moveUp = (index: number) => (event: any): void => {
        move(index, index - 1);
    };

    const moveDown = (index: number) => (event: any): void => {
        move(index, index + 1);
    };

    const type = path.split('.').slice(-1).pop();


    const childPath = (index: number): string => composePaths(path, `${index}`);

    const draggableId = (index: number): string => {
        const childIdPath = composePaths(childPath(index), 'id');
        const childId = Resolve.data(context.core?.data, childIdPath);
        return childId;
    };

    return (
        <Droppable droppableId={path} type={type}>
            {(droppableProvided, snapshot) => (
                <div ref={droppableProvided.innerRef}
                     {...droppableProvided.droppableProps}>
                    {collapsed.map((isCollapsed, index) =>
                        (
                            <Draggable
                                key={draggableId(index)}
                                draggableId={draggableId(index)}
                                index={index}>
                                {(draggableProvided, snapshot) => (
                                    <div ref={draggableProvided.innerRef} {...draggableProvided.dragHandleProps}
                                         {...draggableProvided.draggableProps} className='p-mb-3'>
                                        <ArrayItemRenderer
                                            index={index}
                                            schema={schema}
                                            path={path}
                                            uischema={uischema}
                                            renderers={renderers}
                                            cells={cells}
                                            rootSchema={rootSchema}
                                            enableMoveUp={index != 0}
                                            enableMoveDown={index < data - 1}
                                            config={config}
                                            uischemas={uischemas}
                                            collapsed={isCollapsed}
                                            handleToggle={handleToggle}
                                            moveUp={moveUp}
                                            moveDown={moveDown}
                                            remove={remove}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                    {droppableProvided.placeholder}
                </div>
            )}
        </Droppable>
    );
};


export const ArrayLayoutRenderer: FunctionComponent<ArrayLayoutProps> = ({
                                                                             visible,
                                                                             enabled,
                                                                             id,
                                                                             uischema,
                                                                             schema,
                                                                             label,
                                                                             rootSchema,
                                                                             renderers,
                                                                             cells,
                                                                             data,
                                                                             path,
                                                                             errors,
                                                                             uischemas,
                                                                             addItem,
                                                                         }: ArrayLayoutProps) => {
    const addItemCb = useCallback((p: string, value: any) => addItem(p, value), [
        addItem,
    ]);



    return (
        <ArrayLayout
            label={label}
            uischema={uischema}
            schema={schema}
            id={id}
            rootSchema={rootSchema}
            errors={errors}
            enabled={enabled}
            visible={visible}
            data={data}
            path={path}
            addItem={addItemCb}
            renderers={renderers}
            cells={cells}
            uischemas={uischemas}
        />
    );
};


export const arrayLayoutTester: RankedTester = rankWith(
    2,
    isObjectArrayWithNesting,
);

export default withJsonFormsArrayLayoutProps(ArrayLayoutRenderer);
