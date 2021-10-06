import React, {FunctionComponent, useState} from 'react';
import {
    ArrayControlProps,
    composePaths,
    isObjectArrayWithNesting,
    RankedTester,
    rankWith,
    findUISchema,
    JsonFormsUISchemaRegistryEntry, and, scopeEndsWith,
} from '@jsonforms/core';
import {
    withJsonFormsArrayControlProps, JsonFormsDispatch
} from '@jsonforms/react';

import {Droppable, Draggable, DraggableProvidedDragHandleProps} from 'react-beautiful-dnd';
import {Panel, PanelHeaderTemplateOptions, PanelHeaderTemplateType} from "primereact/panel";
import {MenuItem} from "primereact/menuitem";
import {SplitButton} from "primereact/splitbutton";

import {Section, Input, UniquelyIdentifiable} from "@trrf/form-definition";
import {Avatar} from "primereact/avatar";


export const InputsLayout: FunctionComponent<ArrayControlProps> = ({
                                                                       data,
                                                                       path,
                                                                       schema,
                                                                       uischema,
                                                                       renderers,
                                                                       cells,
                                                                       rootSchema,
                                                                       uischemas,
                                                                       moveUp,
                                                                       moveDown,
                                                                       removeItems
                                                                   }) => {

    const elements = data as Array<Section | Input>;
    const startCollapsed = uischema.scope === '#/properties/inputs';
    const [refresh, setRefresh] = useState(false);

    const isCollapsed = (elementData: UniquelyIdentifiable): boolean => window.localStorage.getItem(elementData.id)
        ? window.localStorage.getItem(elementData.id) === 'true' : startCollapsed;

    const handleToggle = (elementData: UniquelyIdentifiable) => (event: any): void => {
        const currentState: boolean = isCollapsed(elementData);
        console.log(elementData.id, currentState ? 'false' : 'true');
        window.localStorage.setItem(elementData.id, currentState ? 'false' : 'true');
        setRefresh((currentState) => !currentState);
    };

    const elementType = path.split('.').slice(-1).pop();

    const iconMap: Map<string, string> = new Map<string, string>([
        ['default', 'pi-align-justify'],
        ['date', 'pi-calendar'],
        ['boolean', 'pi-check-square'],
        ['text', 'pi-align-left'],
        ['svg', 'pi-image'],
        ['numeric', 'pi-sort-numeric-up'],
        ['currency', 'pi-money-bill']
    ]);

    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions,
                                 index: number,
                                 elementData: Section | Input,
                                 dragHandleProps: DraggableProvidedDragHandleProps | undefined): PanelHeaderTemplateType => {
        const titleClassName = `${options.titleClassName} p-pl-1`;
        const className = `${options.className} p-d-flex`;
        const enableMoveUp = index != 0;
        const enableMoveDown = index < elements.length - 1;
        const {label, name, type} = elementData;

        const collapsed = isCollapsed(elementData);
        const menuOptions: MenuItem[] = [
            removeItems ? {
                label: 'Remove Item',
                icon: 'pi pi-times-circle',
                command: removeItems(path, [index]),
            } : [],
            ...enableMoveUp && moveUp ? [{
                label: 'Move Up',
                icon: 'pi pi-chevron-circle-up',
                command: moveUp(path, index),
            }] : [],
            ...enableMoveDown && moveDown ? [{
                label: 'Move Down',
                icon: 'pi pi-chevron-circle-down',
                command: moveDown(path, index),
            }] : [],
        ];

        return (
            <div className={className} {...dragHandleProps}>
                <div className={titleClassName}>
                    <Avatar icon={`pi ${iconMap.get(type)}`} className="p-mr-2"
                            shape="circle"/>
                    {label || name}
                </div>
                <div className="p-ml-auto">
                    <SplitButton icon={collapsed ? 'pi pi-window-minimize' : 'pi pi-window-maximize'}
                                 dropdownIcon="pi pi-bars"
                                 onClick={options.onTogglerClick}
                                 model={menuOptions}/>
                </div>
            </div>
        );
    };

    const panelContent = (index: number) => {

        const childPath = composePaths(path, `${index}`);
        const foundUISchema =
            findUISchema(
                uischemas as JsonFormsUISchemaRegistryEntry[],
                schema,
                uischema.scope,
                path,
                undefined,
                uischema,
                rootSchema,
            );
        return (
            <JsonFormsDispatch
                schema={schema}
                uischema={foundUISchema}
                path={childPath}
                renderers={renderers}
                cells={cells}
            />
        );
    };


    return (
        <Droppable droppableId={path} type={elementType}>
            {(droppableProvided, snapshot) => (
                <div ref={droppableProvided.innerRef}
                     {...droppableProvided.droppableProps}>
                    {elements.map((elementData: Section | Input, index) =>
                        (
                            <Draggable
                                key={elementData.id}
                                draggableId={elementData.id}
                                index={index}>
                                {(draggableProvided, snapshot) => (
                                    <div ref={draggableProvided.innerRef}
                                         {...draggableProvided.draggableProps}>
                                        <Panel
                                            headerTemplate={(options) => panelHeaderTemplate(options, index, elementData, draggableProvided.dragHandleProps)}
                                            toggleable onToggle={handleToggle(elementData)}
                                            collapsed={isCollapsed(elementData)}>
                                            {panelContent(index)}
                                        </Panel>
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


export const isInputsLayout = and(
    isObjectArrayWithNesting,
    scopeEndsWith('inputs')
);

export const inputsLayoutTester: RankedTester = rankWith(
    2,
    isInputsLayout,
);

export default withJsonFormsArrayControlProps(InputsLayout);
