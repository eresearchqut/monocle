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

import {Droppable, Draggable, DraggableProvided} from 'react-beautiful-dnd';
import {Panel, PanelHeaderTemplateOptions, PanelHeaderTemplateType} from "primereact/panel";

import {MenuItem} from "primereact/menuitem";
import {v4 as uuidv4} from 'uuid';

import {Input, UniquelyIdentifiable} from "@trrf/form-definition";
import {Menubar} from 'primereact/menubar';
import Component from "./Component";
import {confirmDialog} from 'primereact/confirmdialog';


import {Ripple} from 'primereact/ripple';


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
    const [collapsed, setCollapsed] = useState<Map<string, boolean>>(new Map<string, boolean>(inputs.map((input => [input.id, true]))));
    const isCollapsed = (input: UniquelyIdentifiable): boolean | undefined => collapsed.get(input.id);
    const handleToggle = (input: UniquelyIdentifiable) => (event: any): void => {
        setCollapsed((currentState) => {
            const newState = new Map(currentState);
            newState.set(input.id, !currentState.get(input.id))
            return newState;
        })
    };

    const menubar = (input: Input, index: number) => {

        const enableMoveUp = index != 0;
        const enableMoveDown = index < inputs.length - 1;
        const menuOptions: MenuItem[] = [
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
            }] : []
        ];

        return <Menubar model={menuOptions}/>
    }

    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions,
                                 input: Input,
                                 draggableProvided: DraggableProvided | undefined): PanelHeaderTemplateType => {


        const {label, name, type, description} = input;
        const className = `${options.className} p-p-1`
        const toggleIcon = options.collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up';

        return (

            <div className={className}>
                <Component componentType={type} draggableProvided={draggableProvided} description={description}
                           label={label || name}/>

                <button className={options.togglerClassName} onClick={options.onTogglerClick}>
                    <span className={toggleIcon}></span>
                    <Ripple/>
                </button>
            </div>
        );
    };


    const panelContent = (input: Input, index: number) => {
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
            <React.Fragment>
                <JsonFormsDispatch
                    schema={schema}
                    uischema={foundUISchema}
                    path={childPath}
                    renderers={renderers}
                    cells={cells}
                />
                {menubar(input, index)}
            </React.Fragment>
        );
    };


    return (

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
                                    <Panel
                                        headerTemplate={(options) => panelHeaderTemplate(options, input, draggableProvided)}

                                        toggleable
                                        onToggle={handleToggle(input)}
                                        collapsed={isCollapsed(input)}>
                                        {panelContent(input, index)}
                                    </Panel>
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
