import React from 'react';
import { and, ControlProps, ControlState, optionIs, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';
import { Control, withJsonFormsControlProps } from '@jsonforms/react';

import merge from 'lodash/merge';
import { AutoComplete } from 'primereact/autocomplete';
import { startCase } from 'lodash';

import { MultiSelectSvgMap, SingleSelectSvgMap } from '../component/SvgMap';

export class SvgMapControl extends Control<ControlProps, ControlState> {
    render() {
        const { id, label, data, uischema, path, handleChange, config } = this.props;

        const appliedUiSchemaOptions = merge({}, config, uischema.options);
        const { map, hint, multiselect } = appliedUiSchemaOptions;
        const itemTemplate = (item: string) => startCase(item);

        const selectedItemTemplate = (item: string) => startCase(item);

        return (
            <React.Fragment>
                <div className="p-field">
                    <label htmlFor={id} id={id + '-label'}>
                        {label}
                    </label>
                    {hint && <div className="p-text-light p-mb-2">{hint}</div>}
                    {multiselect && (
                        <AutoComplete
                            inputId={id}
                            id={id + '-selected'}
                            value={data || []}
                            multiple
                            itemTemplate={itemTemplate}
                            selectedItemTemplate={selectedItemTemplate}
                            onChange={(e) => handleChange(path, e.value)}
                        />
                    )}
                </div>

                {multiselect && (
                    <MultiSelectSvgMap
                        map={map}
                        value={data}
                        handleChange={(locationIds: string[]) => handleChange(path, locationIds)}
                    />
                )}
                {!multiselect && (
                    <SingleSelectSvgMap
                        map={map}
                        value={data}
                        handleChange={(locationId: string | boolean | undefined) => handleChange(path, locationId)}
                    />
                )}
            </React.Fragment>
        );
    }
}

// export interface SvgMapControlElement extends UISchemaElement, Scopable {
//     type: 'SvgMapControl';
//     label?: string | boolean | LabelDescription;
// }
//
// export const isSvgMapControl = (uischema: any): uischema is SvgMapControlElement =>
//     !isEmpty(uischema) && uischema.scope !== undefined;

export const isSvgMapControl = and(uiTypeIs('Control'), optionIs('type', 'svg-map'));

export const svgMapControlTester: RankedTester = rankWith(2, isSvgMapControl);
export default withJsonFormsControlProps(SvgMapControl);
