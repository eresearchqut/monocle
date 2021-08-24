import React, { useCallback} from 'react';
import {
    ArrayLayoutProps,
    createDefaultValue, isObjectArray, isObjectArrayControl,
    isObjectArrayWithNesting,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {withJsonFormsArrayLayoutProps} from '@jsonforms/react';
import ExpandPanelRenderer from "./ExpandPanelRenderer";
import merge from 'lodash/merge';
import map from 'lodash/map';
import range from 'lodash/range';

export class ArrayLayout extends React.PureComponent<ArrayLayoutProps> {

    innerCreateDefaultValue = () => createDefaultValue(this.props.schema);
    handleChange = (panel: string) => (_event: any, expanded: boolean) => {
        this.setState({
            expanded: expanded ? panel : false
        });
    };
    render() {
        const {
            data,
            path,
            schema,
            uischema,
            errors,
            addItem,
            renderers,
            cells,
            label,
            required,
            rootSchema,
            config,
            uischemas
        } = this.props;
        const appliedUiSchemaOptions = merge(
            {},
            config,
            this.props.uischema.options
        );

        console.log('ArrayLayout', appliedUiSchemaOptions);

        return (
            <div>
                <div>
                    {data > 0 ? (
                        map(range(data), index => {
                            return (
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
                            );
                        })
                    ) : (
                        <p>No data</p>
                    )}
                </div>
            </div>
        );
    }
}



export const ArrayLayoutRenderer = ({
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


/**
 * Default tester for a array layout.
 * @type {RankedTester}
 */
export const arrayLayoutTester: RankedTester = rankWith(
    2,
    isObjectArrayWithNesting
);

export default withJsonFormsArrayLayoutProps(ArrayLayoutRenderer);
