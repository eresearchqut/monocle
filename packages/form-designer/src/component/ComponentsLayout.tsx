import React, {FunctionComponent, useState} from 'react';
import {
    ArrayControlProps,
    composePaths,
    isObjectArrayWithNesting,
    RankedTester,
    rankWith,
    or,
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

import {Input, Section, UniquelyIdentifiable} from "@trrf/form-definition";
import {Menubar} from 'primereact/menubar';
import Component from "./Component";
import {confirmDialog} from 'primereact/confirmdialog';

import {Ripple} from 'primereact/ripple';

export const ComponentsLayout: FunctionComponent<ArrayControlProps> = ({
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

        console.log(id, data, path, schema, uischema)



    const components = data as Array<Input | Section>;
    const startCollapsed = path.endsWith('inputs');


    const [collapsed, setCollapsed] = useState<Map<string, boolean>>(new Map<string, boolean>(components?.map((component => [component.id, startCollapsed]))));

    const isCollapsed = (component: UniquelyIdentifiable): boolean | undefined => collapsed.get(component.id);

    const handleToggle = (component: UniquelyIdentifiable) => (event: any): void => {
        setCollapsed((currentState) => {
            const newState = new Map(currentState);
            newState.set(component.id, !currentState.get(component.id))
            return newState;
        })
    };

    const menubar = (component: Input | Section, index: number) => {

        const componentTypeLabel = path.endsWith('inputs') ? 'Input' : 'Section'
        const enableMoveUp = index != 0;
        const enableMoveDown = index < components.length - 1;
        const menuOptions: MenuItem[] = [
            {
                label: `Copy ${componentTypeLabel}`,
                icon: 'pi pi-copy',
                command: addItem(path, {...component, id: uuidv4()}),
            },
            removeItems ? {
                label: `Remove ${componentTypeLabel}`,
                icon: 'pi pi-times-circle',
                command: () => confirmDialog({
                    message: 'Are you sure?',
                    icon: 'pi pi-exclamation-triangle',
                    accept: removeItems(path, [index]),
                    reject: () => null
                })
            } : [],
            ...enableMoveUp && moveUp ? [{
                label: `Move ${componentTypeLabel} Up`,
                icon: 'pi pi-chevron-circle-up',
                command: moveUp(path, index),
            }] : [],
            ...enableMoveDown && moveDown ? [{
                label: `Move ${componentTypeLabel} Down`,
                icon: 'pi pi-chevron-circle-down',
                command: moveDown(path, index),
            }] : []
        ];

        return <Menubar model={menuOptions}/>
    }

    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions,
                                 component: Input | Section,
                                 draggableProvided: DraggableProvided | undefined): PanelHeaderTemplateType => {


        const {label, name, type, description} = component;
        const className = `${options.className} p-p-1`
        const toggleIcon = options.collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up';

        return (
            <Component componentType={type} className={className} draggableProvided={draggableProvided}
                       description={description}
                       label={label || name}
            >
                <div className={'p-ml-auto'}>
                    <button className={options.togglerClassName} onClick={options.onTogglerClick}>
                        <span className={toggleIcon}></span>
                        <Ripple/>
                    </button>
                </div>
            </Component>
        );
    };


    const panelContent = (component: Input | Section, index: number) => {
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
                {menubar(component, index)}
            </React.Fragment>
        );
    };


    return (
        <Droppable droppableId={path} type={path.endsWith('inputs') ? 'inputs' : 'sections'}>
            {(droppableProvided, snapshot) => (
                <div ref={droppableProvided.innerRef} {...droppableProvided.droppableProps}>
                    {components.map((component, index) =>
                        (
                            <Draggable
                                key={component.id}
                                draggableId={component.id}
                                index={index}>
                                {(draggableProvided, snapshot) => (
                                    <Panel
                                        headerTemplate={(options) => panelHeaderTemplate(options, component, draggableProvided)}
                                        toggleable
                                        onToggle={handleToggle(component)}
                                        collapsed={isCollapsed(component)}>
                                        {panelContent(component, index)}
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


export const isComponentsLayout = and(
    isObjectArrayWithNesting, or(scopeEndsWith('inputs'), scopeEndsWith('sections'))
);

export const componentsLayoutTester: RankedTester = rankWith(
    2,
    isComponentsLayout,
);

export default withJsonFormsArrayControlProps(ComponentsLayout);
