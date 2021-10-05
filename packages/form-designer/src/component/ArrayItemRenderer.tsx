import React, {ComponentType, useMemo, useState, useEffect} from 'react';

import {
    areEqual,
    JsonFormsDispatch,
    JsonFormsStateContext,
    withJsonFormsContext,
} from '@jsonforms/react';

import {
    composePaths,
    ControlElement,
    findUISchema,
    JsonFormsRendererRegistryEntry,
    JsonSchema,
    Resolve,
    JsonFormsCellRendererRegistryEntry,
    JsonFormsUISchemaRegistryEntry,
    createId,
    removeId,
} from '@jsonforms/core';

import get from 'lodash/get';
import {SplitButton} from 'primereact/splitbutton';
import {Panel, PanelHeaderTemplateOptions, PanelHeaderTemplateType} from 'primereact/panel';
import {MenuItem} from 'primereact/menuitem';
import {Draggable, DraggableProvided} from 'react-beautiful-dnd';

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

    handleToggle(index: number): (event: any) => void;

    moveUp(index: number): (event: any) => void;

    moveDown(index: number): (event: any) => void;

    remove(index: number): (event: any) => void;
}

interface StatePropsOfArrayItem extends OwnPropsOfArrayItem {
    childLabel?: string;
    childType?: string;
    childPath: string;
    enableMoveUp: boolean;
    enableMoveDown: boolean;
}

export interface ArrayItemProps
    extends StatePropsOfArrayItem {
}

const ArrayItemRenderer = (props: ArrayItemProps) => {
    const [labelHtmlId] = useState<string>(createId('array-item'));

    const {
        childLabel,
        childType,
        childPath,
        collapsed,
        index,
        moveDown,
        moveUp,
        enableMoveDown,
        enableMoveUp,
        remove,
        path,
        rootSchema,
        schema,
        uischema,
        uischemas,
        renderers,
        cells,
        handleToggle,
    } = props;

    useEffect(() => {
        return () => {
            removeId(labelHtmlId);
        };
    }, [labelHtmlId]);

    const foundUISchema = useMemo(
        () =>
            findUISchema(
                uischemas as JsonFormsUISchemaRegistryEntry[],
                schema,
                uischema.scope,
                path,
                undefined,
                uischema,
                rootSchema,
            ),
        [uischemas, schema, path, uischema, rootSchema],
    );

    const template = (options: PanelHeaderTemplateOptions, draggableProvided: DraggableProvided): PanelHeaderTemplateType => {
        const titleClassName = `${options.titleClassName} p-pl-1`;
        const className = `${options.className} p-d-flex`;
        const menuOptions: MenuItem[] = [
            {
                label: 'Remove Item',
                icon: 'pi pi-times-circle',
                command: remove(index),
            },
            ...enableMoveUp ? [{
                label: 'Move Up',
                icon: 'pi pi-chevron-circle-up',
                command: moveUp(index),
            }] : [],
            ...enableMoveDown ? [{
                label: 'Move Down',
                icon: 'pi pi-chevron-circle-down',
                command: moveDown(index),
            }] : [],
        ];

        return (
            <div className={className}
                 {...draggableProvided.dragHandleProps}>
                <div className={titleClassName} id={labelHtmlId}>
                    {childLabel}{childType ? ` - (${childType})` : ''}
                </div>
                <div className="p-ml-auto">
                    <SplitButton icon={collapsed ? 'pi pi-plus' : 'pi pi-minus'} dropdownIcon="pi pi-cog"
                                 onClick={options.onTogglerClick}
                                 model={menuOptions}/>
                </div>
            </div>
        );
    };


    return (
        <Draggable
            draggableId={childPath}
            index={index}>
            {(draggableProvided, snapshot) => (
                <div ref={draggableProvided.innerRef}
                     {...draggableProvided.draggableProps} className='p-mb-3'>
                    <Panel
                        headerTemplate={(options) => template(options, draggableProvided)}
                        toggleable collapsed={collapsed} onToggle={handleToggle(index)}>
                        <div className='p-mt-3'>
                            <JsonFormsDispatch
                                schema={schema}
                                uischema={foundUISchema}
                                path={childPath}
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

export const withContextToArrayItemProps = (Component: ComponentType<ArrayItemProps>): ComponentType<OwnPropsOfArrayItem> =>
    ({ctx, props}: JsonFormsStateContext) => {
        const {path, index, uischemas} = props;
        const childPath = composePaths(path, `${index}`);
        const childData = Resolve.data(ctx.core.data, childPath);
        const childLabel = get(childData, 'name');
        const childType = get(childData, 'type');
        return (
            <Component
                {...props}
                childLabel={childLabel}
                childPath={childPath}
                childType={childType}
                uischemas={uischemas}
            />
        );
    };

export const withJsonFormsArrayItemProps = (
    Component: ComponentType<ArrayItemProps>,
): ComponentType<OwnPropsOfArrayItem> =>
    withJsonFormsContext(
        // @ts-ignore
        withContextToArrayItemProps(
            React.memo(
                Component,
                (prevProps: ArrayItemProps, nextProps: ArrayItemProps) =>
                    areEqual(prevProps, nextProps),
            ),
        ),
    );

export default withJsonFormsArrayItemProps(ArrayItemRenderer);
