import React, {ComponentType, Dispatch, ReducerAction, useMemo, useState, useEffect, Fragment} from 'react';
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
    getFirstPrimitiveProp,
    createId,
    removeId
} from '@jsonforms/core';

import merge from 'lodash/merge';
import get from 'lodash/get';
import {Badge} from 'primereact/badge';
import {Button} from 'primereact/button';


interface OwnPropsOfExpandPanel {
    index: number;
    path: string;
    uischema: ControlElement;
    schema: JsonSchema;
    expanded: boolean;
    renderers?: JsonFormsRendererRegistryEntry[];
    cells?: JsonFormsCellRendererRegistryEntry[];
    uischemas?: JsonFormsUISchemaRegistryEntry[];
    rootSchema: JsonSchema;
    enableMoveUp: boolean;
    enableMoveDown: boolean;
    config: any;
    childLabelProp?: string;

    handleExpansion(panel: string): (event: any, expanded: boolean) => void;
}

interface StatePropsOfExpandPanel extends OwnPropsOfExpandPanel {
    childLabel: string;
    childPath: string;
    enableMoveUp: boolean;
    enableMoveDown: boolean;
}


export interface DispatchPropsOfExpandPanel {
    removeItems(path: string, toDelete: number[]): (event: any) => void;

    moveUp(path: string, toMove: number): (event: any) => void;

    moveDown(path: string, toMove: number): (event: any) => void;
}

export interface ExpandPanelProps
    extends StatePropsOfExpandPanel,
        DispatchPropsOfExpandPanel {
}

const ExpandPanelRenderer = (props: ExpandPanelProps) => {
    const [labelHtmlId] = useState<string>(createId('expand-panel'));

    useEffect(() => {
        return () => {
            removeId(labelHtmlId);
        };
    }, [labelHtmlId]);

    const {
        childLabel,
        childPath,
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
        cells,
        config
    } = props;

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

    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const {showSortButtons} = appliedUiSchemaOptions;




    return (
        <div className="p-grid p-align-center">

                <div className="p-d-flex ">
                    <Button icon="pi pi-chevron-circle-up"
                            className="p-button-rounded p-button-secondary"
                            disabled={!enableMoveUp}
                            onClick={moveUp(path, index)}
                            aria-label={`Move up`}/>
                    <Button icon="pi pi-chevron-circle-down"
                            className="p-button-rounded p-button-secondary"
                            disabled={!enableMoveDown}
                            aria-label={`Move down`}
                            onClick={moveDown(path, index)}/>

                    <Button icon="pi pi-times-circle"
                            className="p-button-rounded p-button-secondary"
                            aria-label={`Delete`}
                            onClick={removeItems(path, [index])}/>
                </div>



                    <JsonFormsDispatch
                        schema={schema}
                        uischema={foundUISchema}
                        path={childPath}
                        key={childPath}
                        renderers={renderers}
                        cells={cells}
                    />


        </div>
    );
};


export const ctxDispatchToExpandPanelProps: (
    dispatch: Dispatch<ReducerAction<any>>
) => DispatchPropsOfExpandPanel = dispatch => ({
    removeItems: (path: string, toDelete: number[]) => (event: any): void => {
        event.stopPropagation();
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
    moveUp: (path: string, toMove: number) => (event: any): void => {
        event.stopPropagation();
        dispatch(
            update(path, array => {
                moveUp(array, toMove);
                return array;
            })
        );
    },
    moveDown: (path: string, toMove: number) => (event: any): void => {
        event.stopPropagation();
        dispatch(
            update(path, array => {
                moveDown(array, toMove);
                return array;
            })
        );
    }
});


export const withContextToExpandPanelProps = (Component: ComponentType<ExpandPanelProps>): ComponentType<OwnPropsOfExpandPanel> =>
    ({ctx, props}: JsonFormsStateContext) => {
        const dispatchProps = ctxDispatchToExpandPanelProps(ctx.dispatch);
        const {childLabelProp, schema, path, index, uischemas} = props;
        const childPath = composePaths(path, `${index}`);
        const childData = Resolve.data(ctx.core.data, childPath);
        const childLabel = childLabelProp
            ? get(childData, childLabelProp, '')
            : get(childData, getFirstPrimitiveProp(schema), '');

        return (
            <Component
                {...props}
                {...dispatchProps}
                childLabel={childLabel}
                childPath={childPath}
                uischemas={uischemas}
            />
        );
    };

export const withJsonFormsExpandPanelProps = (
    Component: ComponentType<ExpandPanelProps>
): ComponentType<OwnPropsOfExpandPanel> =>
    withJsonFormsContext(
        // @ts-ignore
        withContextToExpandPanelProps(
            React.memo(
                Component,
                (prevProps: ExpandPanelProps, nextProps: ExpandPanelProps) =>
                    areEqual(prevProps, nextProps)
            )
        )
    );

export default withJsonFormsExpandPanelProps(ExpandPanelRenderer);