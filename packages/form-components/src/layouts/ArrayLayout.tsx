import range from 'lodash/range';
import React from 'react';
import {
  ArrayLayoutProps,
  composePaths,
  computeLabel,
  createDefaultValue,
  isPlainLabel
} from '@jsonforms/core';
import map from 'lodash/map';
import { ArrayLayoutToolbar } from './ArrayToolbar';
import PanelRenderer from './PanelRenderer';
import merge from 'lodash/merge';

interface ArrayLayoutState {
  expanded: string | boolean | undefined;
}
export class ArrayLayout extends React.PureComponent<
  ArrayLayoutProps,
    ArrayLayoutState
> {
  state: ArrayLayoutState = {
    expanded: undefined
  };
  innerCreateDefaultValue = () => createDefaultValue(this.props.schema);
  handleChange = (panel: string) => (_event: any, expanded: boolean) => {
    this.setState({
      expanded: expanded ? panel : false
    });
  };
  isExpanded = (index: number) =>
    this.state.expanded === composePaths(this.props.path, `${index}`);
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

    return (
      <div>
        <ArrayLayoutToolbar
          label={computeLabel(
            isPlainLabel(label) ? label : label.default,
            !!required,
            appliedUiSchemaOptions.hideRequiredAsterisk
          )}
          errors={errors}
          path={path}
          addItem={addItem}
          createDefault={this.innerCreateDefaultValue}
        />
        <div>
          {data > 0 ? (
            map(range(data), index => {
              return (
                <PanelRenderer
                  index={index}
                  expanded={this.isExpanded(index)}
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
