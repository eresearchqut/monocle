import React from 'react';
import { and, ControlProps, ControlState, optionIs, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';
import { Control, withJsonFormsControlProps } from '@jsonforms/react';

import merge from 'lodash/merge';

import { SampleContainer } from '../../component/Biobank/SampleContainer';
import { isInteger } from 'lodash';

const validDimension = (x: number) => isInteger(x) && x > 0;

export class SampleContainerControl extends Control<ControlProps, ControlState> {
    render() {
        const { id, label, data, uischema, config } = this.props;

        const appliedUiSchemaOptions = merge({}, config, uischema.options);
        const { hint }: { hint: string } = appliedUiSchemaOptions;

        const { width, length, samples } = merge({ samples: [] }, data);
        // TODO how do we check if some props are missing?
        // Can we check against the JSON schema?
        // Do we show errors if the props are missing?
        const requiredPropsProvided = validDimension(width) && validDimension(length);

        return (
            <div className="p-field">
                <label htmlFor={id} id={id + '-label'}>
                    {label}
                </label>
                {hint && <div className="p-text-light p-mb-2">{hint}</div>}
                {requiredPropsProvided && (
                    <SampleContainer dimensions={{ width: width, length: length }} samples={samples} />
                )}
            </div>
        );
    }
}

export const isSampleContainerControl = and(uiTypeIs('Control'), optionIs('type', 'biobank-sample-container'));

export const sampleContainerControlTester: RankedTester = rankWith(2, isSampleContainerControl);
export default withJsonFormsControlProps(SampleContainerControl);
