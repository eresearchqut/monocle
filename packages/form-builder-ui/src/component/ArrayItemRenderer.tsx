import React, {ComponentType, Dispatch, ReducerAction, useMemo, useState, useEffect, Fragment} from 'react';
import {
    areEqual,
    JsonFormsDispatch,
    JsonFormsStateContext,
    withJsonFormsContext
} from '@jsonforms/react';
import {
    composePaths,
    ControlElement,
    findUISchema,
    JsonFormsRendererRegistryEntry,
    JsonSchema,
    moveDown,
    moveUp,
    Resolve,
    update,
    JsonFormsCellRendererRegistryEntry,
    JsonFormsUISchemaRegistryEntry,
    getFirstPrimitiveProp,
    createId,
    removeId
} from '@jsonforms/core';

import get from 'lodash/get';
import {Button} from 'primereact/button';
import {Panel, PanelHeaderTemplateOptions, PanelHeaderTemplateType, PanelIconsTemplateType} from 'primereact/panel';
import {Draggable, DraggableProvided} from "react-beautiful-dnd";

interface OwnPropsOfArrayItem {
    index: number;
    path: string;
    uischema: ControlElement;
    schema: JsonSchema;
    renderers?: JsonFormsRendererRegistryEntry[];
    cells?: JsonFormsCellRendererRegistryEntry[];
    uischemas?: JsonFormsUISchemaRegistryEntry[];
    rootSchema: JsonSchema;
    enableMoveUp: boolean;
    enableMoveDown: boolean;
    config: any;
}

interface StatePropsOfArrayItem extends OwnPropsOfArrayItem {
    childLabel: string;
    childPath: string;
    childType: string;
    enableMoveUp: boolean;
    enableMoveDown: boolean;
}


export interface DispatchPropsOfArrayItem {
    removeItems(path: string, toDelete: number[]): (event: any) => void;

    moveUp(path: string, toMove: number): (event: any) => void;

    moveDown(path: string, toMove: number): (event: any) => void;
}

export interface ArrayItemProps
    extends StatePropsOfArrayItem,
        DispatchPropsOfArrayItem {
}

const ArrayItemRenderer = (props: ArrayItemProps) => {
    const [labelHtmlId] = useState<string>(createId('array-item'));

    useEffect(() => {
        return () => {
            removeId(labelHtmlId);
        };
    }, [labelHtmlId]);

    const {
        childLabel,
        childType,
        childPath,
        index,
        moveDown,
        moveUp,
        enableMoveDown,
        enableMoveUp,
        removeItems,
        path,
        rootSchema,
        schema,
        uischema,
        uischemas,
        renderers,
        cells
    } = props;

    const foundUISchema = useMemo(
        () =>
            findUISchema(
                uischemas as JsonFormsUISchemaRegistryEntry[],
                schema,
                uischema.scope,
                path,
                undefined,
                uischema,
                rootSchema
            ),
        [uischemas, schema, uischema.scope, path, uischema, rootSchema]
    );




    const template = (options: PanelHeaderTemplateOptions, draggableProvided: DraggableProvided): PanelHeaderTemplateType => {

        const titleClassName = `${options.titleClassName} p-pl-1`;
        const className = `${options.className} p-d-flex`;

        return (
            <div className={className}
                 {...draggableProvided.dragHandleProps}>
                <div className={titleClassName} id={labelHtmlId}>
                    {childLabel}{childType ? ` - (${childType})` : ''}
                </div>
                <div className="p-ml-auto">
                    <Button icon="pi pi-chevron-circle-up "
                            className="p-button-rounded p-button-secondary p-mr-1"
                            disabled={!enableMoveUp}
                            onClick={moveUp(path, index)}
                            aria-label={`Move up`}
                    />
                    <Button icon="pi pi-chevron-circle-down "
                            className="p-button-rounded p-button-secondary p-mr-1"
                            disabled={!enableMoveDown}
                            aria-label={`Move down`}
                            onClick={moveDown(path, index)}
                    />
                    <Button icon="pi pi-times-circle"
                            className="p-button-rounded p-button-warning"
                            aria-label={`Delete`}
                            onClick={removeItems(path, [index])}
                    />
                </div>
            </div>
        )
    }
    return (

        <Draggable
            key={composePaths(path, `${index}`)}
            draggableId={composePaths(path, `${index}`)}
            index={index}>
            {(draggableProvided, snapshot) => (
                <div ref={draggableProvided.innerRef}
                     {...draggableProvided.draggableProps} className='p-mb-3'>
                    <Panel headerTemplate={(options) => template(options, draggableProvided)} >
                        <div className='p-mt-3'>
                            <JsonFormsDispatch
                                schema={schema}
                                uischema={foundUISchema}
                                path={childPath}
                                key={childPath}
                                renderers={renderers}
                                cells={cells}
                            />
                        </div>
                    </Panel>
                </div>
            )}

        </Draggable>
    );
};


export const ctxDispatchToArrayItemProps: (
    dispatch: Dispatch<ReducerAction<any>>
) => DispatchPropsOfArrayItem = dispatch => ({
    removeItems: (path: string, toDelete: number[]) => (event: any): void => {
        event.stopPropagation();
        dispatch(
            update(path, array => {
                toDelete
                    .sort()
                    .reverse()
                    .forEach(s => array.splice(s, 1));
                return array;
            })
        );
    },
    moveUp: (path: string, toMove: number) => (event: any): void => {
        event.stopPropagation();
        dispatch(
            update(path, array => {
                moveUp(array, toMove);
                return array;
            })
        );
    },
    moveDown: (path: string, toMove: number) => (event: any): void => {
        event.stopPropagation();
        dispatch(
            update(path, array => {
                moveDown(array, toMove);
                return array;
            })
        );
    }
});


export const withContextToArrayItemProps = (Component: ComponentType<ArrayItemProps>): ComponentType<OwnPropsOfArrayItem> =>
    ({ctx, props}: JsonFormsStateContext) => {
        const dispatchProps = ctxDispatchToArrayItemProps(ctx.dispatch);
        const {schema, path, index, uischemas} = props;
        const childPath = composePaths(path, `${index}`);
        const childData = Resolve.data(ctx.core.data, childPath);
        const childLabel = get(childData, 'name', '') || get(childData, getFirstPrimitiveProp(schema), '');
        const childType = get(childData, 'sectionType', '') || get(childData, 'inputType', '');

        return (
            <Component
                {...props}
                {...dispatchProps}
                childLabel={childLabel}
                childPath={childPath}
                childType={childType}
                uischemas={uischemas}
            />
        );
    };

export const withJsonFormsArrayItemProps = (
    Component: ComponentType<ArrayItemProps>
): ComponentType<OwnPropsOfArrayItem> =>
    withJsonFormsContext(
        // @ts-ignore
        withContextToArrayItemProps(
            React.memo(
                Component,
                (prevProps: ArrayItemProps, nextProps: ArrayItemProps) =>
                    areEqual(prevProps, nextProps)
            )
        )
    );

export default withJsonFormsArrayItemProps(ArrayItemRenderer);