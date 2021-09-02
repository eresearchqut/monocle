import React, {FunctionComponent, useCallback} from 'react';
import {
    ArrayLayoutProps,
    composePaths,
    createDefaultValue,
    isObjectArrayWithNesting,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {withJsonFormsArrayLayoutProps} from '@jsonforms/react';
import ExpandPanelRenderer from "./ExpandPanelRenderer";
import merge from 'lodash/merge';
import map from 'lodash/map';
import range from 'lodash/range';
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {Card} from "primereact/card";

export class ArrayLayout extends React.PureComponent<ArrayLayoutProps> {

    innerCreateDefaultValue = () => createDefaultValue(this.props.schema);
    handleChange = (panel: string) => (_event: any, expanded: boolean) => {
        this.setState({
            expanded: expanded ? panel : false
        });
    };

    render() {
        const {
            id,
            data,
            path,
            schema,
            uischema,
            renderers,
            cells,
            rootSchema,
            config,
            uischemas
        } = this.props;
        const appliedUiSchemaOptions = merge(
            {},
            config,
            this.props.uischema.options
        );


        return (

            <Droppable droppableId={id}>
                {(droppableProvided, snapshot) => (
                    <div ref={droppableProvided.innerRef}
                         {...droppableProvided.droppableProps}>
                        {map(range(data), index => (
                            <Draggable
                                key={composePaths(path, `${index}`)}
                                draggableId={composePaths(path, `${index}`)}
                                index={index}
                            >
                                {(draggableProvided, snapshot) => (
                                    <div ref={draggableProvided.innerRef}
                                         {...draggableProvided.draggableProps}
                                         {...draggableProvided.dragHandleProps}
                                    >
                                        <ExpandPanelRenderer
                                            index={index}
                                            expanded={true}
                                            schema={schema}
                                            path={path}
                                            handleExpansion={this.handleChange}
                                            uischema={uischema}
                                            renderers={renderers}
                                            cells={cells}
                                            key={index}
                                            rootSchema={rootSchema}
                                            enableMoveUp={index != 0}
                                            enableMoveDown={index < data - 1}
                                            config={config}
                                            childLabelProp={appliedUiSchemaOptions.elementLabelProp}
                                            uischemas={uischemas}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                    </div>
                )}
            </Droppable>

        );
    }
}


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
                                                                             addItem
                                                                         }: ArrayLayoutProps) => {

    const addItemCb = useCallback((p: string, value: any) => addItem(p, value), [
        addItem
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
    isObjectArrayWithNesting
);

export default withJsonFormsArrayLayoutProps(ArrayLayoutRenderer);
