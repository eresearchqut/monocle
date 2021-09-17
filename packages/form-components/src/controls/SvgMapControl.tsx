import React from 'react';
import {
    and,
    ControlProps,
    ControlState, optionIs,
    RankedTester,
    rankWith, uiTypeIs
} from '@jsonforms/core';
import {Control, withJsonFormsControlProps} from '@jsonforms/react';

import Maps from '../maps'
import merge from "lodash/merge";
import {AutoComplete} from 'primereact/autocomplete';
import {startCase} from "lodash";

import {MultiSelectSvgMap} from "../component/SvgMap";



export class SvgMapControl extends Control<ControlProps, ControlState> {
    render() {

        const {
            id,
            label,
            data,
            uischema,
            path,
            handleChange,
            config
        } = this.props;

        const appliedUiSchemaOptions = merge({}, config, uischema.options);
        const {map, hint} = appliedUiSchemaOptions;
        const itemTemplate = (item: string) => startCase(item);

        const selectedItemTemplate = (item: string) => startCase(item);
        // @ts-ignore
        const svgMap = Maps[map];

        return (
            <div className="p-grid">

                <div className="p-col-sm-6 p-md-4">
                    <div className="p-field">
                        <label htmlFor={id} id={id + '-label'}>{label}</label>
                        { hint &&
                        <div className="p-text-light p-mb-2">{hint}</div>
                        }
                      <AutoComplete inputId={id} id={id + '-selected'} value={data || []} multiple
                                    itemTemplate={itemTemplate}
                                    selectedItemTemplate={selectedItemTemplate}
                                    onChange={(e) => handleChange(path, e.value)}/>


                    </div>
                </div>
                <div className="p-col-sm-6 p-md-8">
                    <MultiSelectSvgMap map={svgMap} value={data} handleChange={(locationIds: string[]) => handleChange(path, locationIds)}   />
                </div>
            </div>

        )
    }
}

// export interface SvgMapControlElement extends UISchemaElement, Scopable {
//     type: 'SvgMapControl';
//     label?: string | boolean | LabelDescription;
// }
//
// export const isSvgMapControl = (uischema: any): uischema is SvgMapControlElement =>
//     !isEmpty(uischema) && uischema.scope !== undefined;

export const isSvgMapControl = and(
    uiTypeIs('Control'),
    optionIs('type', 'svg-map')
);



export const svgMapControlTester: RankedTester = rankWith(2,isSvgMapControl);
export default withJsonFormsControlProps(SvgMapControl);
