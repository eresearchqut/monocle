import React, {FunctionComponent, useState} from 'react';
import {
    ArrayControlProps,
    composePaths,
    isObjectArrayWithNesting,
    RankedTester,
    rankWith,
    findUISchema,
    scopeEndsWith,
    Tester,
    JsonFormsUISchemaRegistryEntry, and
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

    const [refresh, setRefresh] = useState(false);

    const isCollapsed = (section: UniquelyIdentifiable): boolean => window.localStorage.getItem(section.id)
        ? window.localStorage.getItem(section.id) === 'true' : false;

    const handleToggle = (section: UniquelyIdentifiable) => (event: any): void => {
        const currentState: boolean = isCollapsed(section);
        console.log(section.id, currentState ? 'false' : 'true');
        window.localStorage.setItem(section.id, currentState ? 'false' : 'true');
        setRefresh((currentState) => !currentState);
    };

    const elementType = path.split('.').slice(-1).pop();



    const panelHeaderTemplate = (options: PanelHeaderTemplateOptions,
                                 index: number,
                                 section: Section,
                                 dragHandleProps: DraggableProvidedDragHandleProps | undefined): PanelHeaderTemplateType => {
        const titleClassName = `${options.titleClassName} p-pl-1 pi-mr-2`;
        const className = `${options.className} p-d-flex`;
        const enableMoveUp = index != 0;
        const enableMoveDown = index < sections.length - 1;
        const {label, name} = section;
        const collapsed = isCollapsed(section);
        const menuOptions: MenuItem[] = [
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
            }] : [],
        ];

        return (
            <div className={className}>
                <Avatar icon='pi pi-align-justify' className="p-mr-2"
                        shape="circle"/>
                <div className={titleClassName}>

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
                    {sections.map((section: Section, index) =>
                        (
                            <Draggable
                                key={section.id}
                                draggableId={section.id}
                                index={index}>
                                {(draggableProvided, snapshot) => (
                                    <div ref={draggableProvided.innerRef}
                                         {...draggableProvided.draggableProps}>
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
