import React, { useState } from 'react';
import { Slider, SliderChangeParams } from 'primereact/slider';
import merge from 'lodash/merge';
import { and, CellProps, optionIs, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';
import { InputNumber, InputNumberChangeParams } from 'primereact/inputnumber';
import { withJsonFormsCellProps } from '@jsonforms/react';

export interface InputRangeCellOptions {
  animate?: boolean;
  groupNumbers?: boolean;
  upperLabel?: string;
  lowerLabel?: string;
  focus?: boolean;
  locale?: string;
}

export const InputRangeCell = (props: CellProps) => {
  const { id, config, data, uischema, schema, path, handleChange, enabled = true, visible = true } = props;

  const [value, setValue] = useState(data);
  const { minimum, maximum, multipleOf } = schema;
  const { groupNumbers = false, focus, locale, upperLabel, lowerLabel } = merge(
    {},
    config,
    uischema.options
  ) as InputRangeCellOptions;

  if (!visible) {
    return null;
  }

  const onSliderChange = (e: SliderChangeParams) => {
    if (e.originalEvent.type === 'click') {
      handleChange(path, e.value);
    }
    setValue(() => e.value);
  };

  const onInputChange = (e: InputNumberChangeParams) => {
    setValue(() => e.value);
    handleChange(path, e.value);
  };

  const labels =
    upperLabel || lowerLabel ? (
      <div className="p-d-flex p-jc-between p-mt-2">
        <div>{lowerLabel}</div>
        <div>{upperLabel}</div>
      </div>
    ) : undefined;

  return (
    <React.Fragment>
      <InputNumber
        id={`${id}-input`}
        value={value}
        min={minimum}
        max={maximum}
        onChange={onInputChange}
        step={multipleOf}
        showButtons
        useGrouping={groupNumbers}
        disabled={!enabled}
        locale={locale}
        autoFocus={focus}
      />
      <Slider
        id={id}
        value={value}
        disabled={!enabled}
        min={minimum}
        max={maximum}
        step={multipleOf}
        onChange={onSliderChange}
        onSlideEnd={(e) => handleChange(path, value)}
      />
      {labels}
    </React.Fragment>
  );
};

/**
 * Default tester for range controls.
 * @type {RankedTester}
 */
export const inputRangeCellTester: RankedTester = rankWith(2, and(uiTypeIs('Control'), optionIs('type', 'range')));

export default withJsonFormsCellProps(InputRangeCell);
