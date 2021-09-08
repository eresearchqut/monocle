import React, {FunctionComponent, useCallback} from 'react';
import {
    ArrayLayoutProps,
    createDefaultValue,
    isObjectArrayWithNesting,
    RankedTester,
    rankWith,
    update
} from '@jsonforms/core';
import {
    JsonFormsStateContext,
    useJsonForms,
    withJsonFormsArrayLayoutProps
} from '@jsonforms/react';
import ArrayItemRenderer from "./ArrayItemRenderer";
import merge from 'lodash/merge';
import map from 'lodash/map';
import range from 'lodash/range';
import {DragDropContext, Droppable, DropResult, ResponderProvided} from "react-beautiful-dnd";

const arrayMove = (arr: [], fromIndex: number, toIndex: number) => {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
}

interface ArrayLayoutContext extends ArrayLayoutProps {
    context: JsonFormsStateContext;
}

export class ArrayLayout extends React.PureComponent<ArrayLayoutContext> {

    innerCreateDefaultValue = () => createDefaultValue(this.props.schema);


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
            uischemas,
            context
        } = this.props;



        const appliedUiSchemaOptions = merge(
            {},
            config,
            this.props.uischema.options
        );

        const onDragEnd = (result: DropResult) => {
            if (context.dispatch) {
                context.dispatch(
                    update(path, array => {
                        arrayMove(array, result.source.index, result.destination?.index || 0);
                        return array;
                    })
                );
            }
        }

        return (


            <DragDropContext onDragEnd={(result: DropResult, provided: ResponderProvided) => onDragEnd(result)}>
                <Droppable droppableId={id}>
                    {(droppableProvided, snapshot) => (
                        <div ref={droppableProvided.innerRef}
                             {...droppableProvided.droppableProps}>
                            {map(range(data), index => (
                                <ArrayItemRenderer
                                    index={index}
                                    schema={schema}
                                    path={path}
                                    uischema={uischema}
                                    renderers={renderers}
                                    cells={cells}
                                    key={index}
                                    rootSchema={rootSchema}
                                    enableMoveUp={index != 0}
                                    enableMoveDown={index < data - 1}
                                    config={config}
                                    uischemas={uischemas}
                                />
                            ))}
                            {droppableProvided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
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

    const context = useJsonForms();

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
            context={context}
        />
    );
};


export const arrayLayoutTester: RankedTester = rankWith(
    2,
    isObjectArrayWithNesting
);

export default withJsonFormsArrayLayoutProps(ArrayLayoutRenderer);
