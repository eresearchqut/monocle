import React from 'react';
import {ControlProps, ControlState, isBooleanControl, RankedTester, rankWith} from '@jsonforms/core';
import {Control, withJsonFormsControlProps} from '@jsonforms/react';

// @ts-ignore
import {CheckboxSVGMap} from "react-svg-map";
import Maps from '../maps'
import "react-svg-map/lib/index.css";

import merge from "lodash/merge";
import {AutoComplete} from 'primereact/autocomplete';
import {startCase} from "lodash";

import {MultiSelectSvgMap} from "../component/SvgMap/MultiSelectSvgMap";


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
        const {map} = appliedUiSchemaOptions;
        const itemTemplate = (item: string) => startCase(item);

        const selectedItemTemplate = (item: string) => startCase(item);
        // @ts-ignore
        const svgMap = Maps[map];

        return (
            <div className="p-grid">
                <div className="p-col-sm-6 p-md-8">
                    <MultiSelectSvgMap map={svgMap} value={data} handleChange={(locationIds) => handleChange(path, locationIds)}   />
                </div>
                <div className="p-col-sm-6 p-md-4">
                    <div className="p-inputgroup p-field">
                        <span className="p-float-label">
                              <AutoComplete inputId={id} id={id + '-selected'} value={data || []} multiple
                                            itemTemplate={itemTemplate}
                                            selectedItemTemplate={selectedItemTemplate}
                                            onChange={(e) => handleChange(path, e.value)}/>
                            <label htmlFor={id} id={id + '-label'}>{label}</label>
                        </span>
                    </div>
                </div>
            </div>

        )
    }
}

export const svgMapControlTester: RankedTester = rankWith(2, isBooleanControl);
export default withJsonFormsControlProps(SvgMapControl);
