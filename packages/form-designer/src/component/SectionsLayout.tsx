import React, {FunctionComponent, useState} from 'react';
import {
    and,
    ArrayControlProps,
    composePaths,
    findUISchema, isObjectArrayWithNesting,
    JsonFormsUISchemaRegistryEntry, RankedTester, rankWith,
    scopeEndsWith
} from '@jsonforms/core';
import {JsonFormsDispatch, withJsonFormsArrayControlProps} from '@jsonforms/react';

import {Draggable, DraggableProvidedDragHandleProps, Droppable} from 'react-beautiful-dnd';
import {Panel, PanelHeaderTemplateOptions, PanelHeaderTemplateType} from "primereact/panel";
import {MenuItem} from "primereact/menuitem";

import {Section, SectionType, UniquelyIdentifiable} from "@trrf/form-definition";
import {Menubar} from 'primereact/menubar';
import Component from "./Component";

export const SectionsLayout: FunctionComponent<ArrayControlProps> = ({
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

    const sections = data as Array<Section>;
    const [collapsed, setCollapsed] = useState<Map<string, boolean>>(new Map<string, boolean>(sections.map((section => [section.id, false]))));
    const isCollapsed = (section: UniquelyIdentifiable): boolean | undefined => collapsed.get(section.id);
    const handleToggle = (section: UniquelyIdentifiable) => (event: any): void => {
        setCollapsed((currentState) => {
            const newState = new Map(currentState);
            newState.set(section.id, !currentState.get(section.id))
            return newState;
        })
    };


    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions,
                                 index: number,
                                 section: Section,
                                 dragHandleProps: DraggableProvidedDragHandleProps | undefined): PanelHeaderTemplateType => {
        const titleClassName = `${options.titleClassName} p-pl-1 pi-mr-2`;
        const className = `${options.className}`;
        const enableMoveUp = index != 0;
        const enableMoveDown = index < sections.length - 1;
        const {label, name} = section;
        const collapsed = isCollapsed(section);
        const menuOptions: MenuItem[] = [
            {
                icon: 'pi pi-fw pi-cog',
                items: [
                    collapsed ? {
                        label: 'Edit Section',
                        icon: 'pi pi-window-maximize',
                        command: handleToggle(section)
                    } : {
                        label: 'Minimise Section',
                        icon: 'pi pi-window-minimize',
                        command: handleToggle(section)
                    },
                    removeItems ? {
                        label: 'Remove Section',
                        icon: 'pi pi-times-circle',
                        command: removeItems(path, [index]),
                    } : [],
                    ...enableMoveUp && moveUp ? [{
                        label: 'Move Section Up',
                        icon: 'pi pi-chevron-circle-up',
                        command: moveUp(path, index),
                    }] : [],
                    ...enableMoveDown && moveDown ? [{
                        label: 'Move Section Down',
                        icon: 'pi pi-chevron-circle-down',
                        command: moveDown(path, index),
                    }] : []]
            }
        ];

        return (
            <div className={className} {...dragHandleProps}>
                <div className='p-d-flex p-ai-center'>
                    <Component componentType={SectionType.DEFAULT}/>
                    <div className={titleClassName}>{label || name}</div>
                </div>
                <Menubar model={menuOptions} />

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
        }
    ;

    return (
        <React.Fragment>
            <Droppable droppableId={path} type='sections'>
                {(droppableProvided, snapshot) => (
                    <div ref={droppableProvided.innerRef}
                         {...droppableProvided.droppableProps}
                         className='sections'>
                        {sections.map((section: Section, index) =>
                            (
                                <Draggable
                                    key={section.id}
                                    draggableId={section.id}
                                    index={index}>
                                    {(draggableProvided, snapshot) => (
                                        <div ref={draggableProvided.innerRef}
                                             {...draggableProvided.draggableProps} className='section'>
                                            <Panel
                                                headerTemplate={(options) => panelHeaderTemplate(options, index, section, draggableProvided.dragHandleProps)}
                                                toggleable onToggle={handleToggle(section)}
                                                collapsed={isCollapsed(section)}>
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


export const isSectionsLayout = and(
    isObjectArrayWithNesting,
    scopeEndsWith('sections')
);


export const sectionsLayoutTester: RankedTester = rankWith(
    1,
    isSectionsLayout
);


export default withJsonFormsArrayControlProps(SectionsLayout);
