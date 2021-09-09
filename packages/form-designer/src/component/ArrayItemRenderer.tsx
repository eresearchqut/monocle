import React, {ComponentType, Dispatch, ReducerAction, useMemo, useState, useEffect} from 'react';

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
    createId,
    removeId
} from '@jsonforms/core';

import get from 'lodash/get';
import {SplitButton} from 'primereact/splitbutton';
import {Panel, PanelHeaderTemplateOptions, PanelHeaderTemplateType} from 'primereact/panel';
import {MenuItem, MenuItemCommandParams} from 'primereact/menuitem';
import {Draggable, DraggableProvided} from "react-beautiful-dnd";

interface OwnPropsOfArrayItem {
    index: number;
    path: string;
    uischema: ControlElement;
    schema: JsonSchema;
    collapsed: boolean;
    renderers?: JsonFormsRendererRegistryEntry[];
    cells?: JsonFormsCellRendererRegistryEntry[];
    uischemas?: JsonFormsUISchemaRegistryEntry[];
    rootSchema: JsonSchema;
    enableMoveUp: boolean;
    enableMoveDown: boolean;
    config: any;
    handleToggle(panel: string): (event: any) => void;
}

interface StatePropsOfArrayItem extends OwnPropsOfArrayItem {
    childLabel?: string;
    childType?: string;
    childPath: string;
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
    const [panelCollapsed, setPanelCollapsed] = useState<boolean>(true);

    const {
        childLabel,
        childType,
        childPath,
        collapsed,
        handleToggle,
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

    useEffect(() => {
        return () => {
            removeId(labelHtmlId);
        };
    }, [labelHtmlId]);

    useEffect(() => {
        return () => {
            setPanelCollapsed(collapsed);
        };
    }, [collapsed]);






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

        const menuOptions: MenuItem[] = [
            {
                label: 'Remove Item',
                icon: 'pi pi-times-circle',
                command: removeItems(path, [index])
            },
            ...enableMoveUp ? [{
                label: 'Move Up',
                icon: 'pi pi-chevron-circle-up',
                command: moveUp(path, index)
            }] : [],
            ...enableMoveDown ? [{
                label: 'Move Down',
                icon: 'pi pi-chevron-circle-down',
                command: moveDown(path, index)
            }] : []
        ];


        return (
            <div className={className}
                 {...draggableProvided.dragHandleProps}>
                <div className={titleClassName} id={labelHtmlId}>
                    {childLabel}{childType ? ` - (${childType})` : ''}
                </div>
                <div className="p-ml-auto">
                    <SplitButton  icon="pi pi-cog"
                                 onClick={() => setPanelCollapsed((current) => !current)}
                                 model={menuOptions}/>
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
                    <Panel headerTemplate={(options) => template(options, draggableProvided)}
                           toggleable onToggle={handleToggle(childPath)} collapsed={panelCollapsed}>
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
    removeItems: (path: string, toDelete: number[]) => (event: MenuItemCommandParams): void => {
        event.originalEvent.stopPropagation();
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
    moveUp: (path: string, toMove: number) => (event: MenuItemCommandParams): void => {
        event.originalEvent.stopPropagation();
        dispatch(
            update(path, array => {
                moveUp(array, toMove);
                return array;
            })
        );
    },
    moveDown: (path: string, toMove: number) => (event: MenuItemCommandParams): void => {
        event.originalEvent.stopPropagation();
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
        const childLabel = get(childData, 'name');
        const childType = get(childData, 'type');

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