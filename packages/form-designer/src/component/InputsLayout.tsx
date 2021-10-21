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
import {v4 as uuidv4} from 'uuid';

import {Input, UniquelyIdentifiable} from "@trrf/form-definition";
import {Menubar} from 'primereact/menubar';
import ComponentIcon from "./ComponentIcon";
import {confirmDialog} from 'primereact/confirmdialog';

//https://codesandbox.io/s/40p81qy7v0?file=/index.js:1751-1776

export const InputsLayout: FunctionComponent<ArrayControlProps> = ({
                                                                       id,
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
                                                                       removeItems,
                                                                       addItem
                                                                   }) => {

    const inputs = data as Array<Input>;
    const [collapsed, setCollapsed] = useState<Map<string, boolean>>(new Map<string, boolean>(inputs.map((input => [input.id, false]))));
    const isCollapsed = (input: UniquelyIdentifiable): boolean | undefined => collapsed.get(input.id);
    const handleToggle = (input: UniquelyIdentifiable) => (event: any): void => {
        setCollapsed((currentState) => {
            const newState = new Map(currentState);
            newState.set(input.id, !currentState.get(input.id))
            return newState;
        })
    };

    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions,
                                 index: number,
                                 input: Input,
                                 dragHandleProps: DraggableProvidedDragHandleProps | undefined): PanelHeaderTemplateType => {

        const className = `${options.className} p-d-flex`;
        const titleClassName = `${options.titleClassName} p-mr-3`;
        const enableMoveUp = index != 0;
        const enableMoveDown = index < inputs.length - 1;
        const {label, name, type} = input;

        const collapsed = isCollapsed(input);
        const menuOptions: MenuItem[] = [
            collapsed ? {
                label: 'Edit ',
                icon: 'pi pi-window-maximize',
                command: handleToggle(input)
            } : {
                label: 'Close',
                icon: 'pi pi-window-minimize',
                command: handleToggle(input)
            },
            {
                label: 'Options',
                icon: 'pi pi-fw pi-cog',
                items: [
                    {
                        label: 'Copy Input',
                        icon: 'pi pi-copy',
                        command: addItem(path, {...input, id: uuidv4()}),
                    },
                    removeItems ? {
                        label: 'Remove Input',
                        icon: 'pi pi-times-circle',
                        command: () => confirmDialog({
                            message: 'Are you sure?',
                            icon: 'pi pi-exclamation-triangle',
                            accept: removeItems(path, [index]),
                            reject: () => null
                        })
                    } : [],
                    ...enableMoveUp && moveUp ? [{
                        label: 'Move Input Up',
                        icon: 'pi pi-chevron-circle-up',
                        command: moveUp(path, index),
                    }] : [],
                    ...enableMoveDown && moveDown ? [{
                        label: 'Move Input Down',
                        icon: 'pi pi-chevron-circle-down',
                        command: moveDown(path, index),
                    }] : []]
            }
        ];

        return (
            <div className={className}  {...dragHandleProps}>
                <div className="p-mr-3">
                    <ComponentIcon componentType={type}/>
                </div>
                <div className={titleClassName}>{label || name}</div>
                <div className="p-ml-auto">
                    <Menubar model={menuOptions}/>
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
        <React.Fragment>
            <Droppable droppableId={path} type='inputs'>
                {(droppableProvided, snapshot) => (
                    <div ref={droppableProvided.innerRef}
                         {...droppableProvided.droppableProps}>
                        {inputs.map((input: Input, index) =>
                            (
                                <Draggable
                                    key={input.id}
                                    draggableId={input.id}
                                    index={index}>
                                    {(draggableProvided, snapshot) => (
                                        <div ref={draggableProvided.innerRef} className='p-mb-1'
                                             {...draggableProvided.draggableProps}>
                                            <Panel
                                                headerTemplate={(options) => panelHeaderTemplate(options, index, input, draggableProvided.dragHandleProps)}
                                                toggleable onToggle={handleToggle(input)}
                                                collapsed={isCollapsed(input)}>
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
        </React.Fragment>
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
