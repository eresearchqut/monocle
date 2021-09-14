import React, {useState} from 'react';
import {ControlProps, ControlState, isBooleanControl, RankedTester, rankWith} from '@jsonforms/core';
import {Control, withJsonFormsControlProps} from '@jsonforms/react';

import {CheckboxSVGMap} from "react-svg-map";
import Map from '../maps/body'
import "react-svg-map/lib/index.css";

import merge from "lodash/merge";
import {AutoComplete} from 'primereact/autocomplete';

interface Node {
    id
}

export class SvgMapControl extends Control<ControlProps, ControlState> {
    render() {

        const {
            id,
            label,
            data,
            uischema,
            path,
            handleChange,
            config,
            required
        } = this.props;


        const appliedUiSchemaOptions = merge({}, config, uischema.options);


        const handleNodesSelections = (selectedNodes: Node[]) => {
            handleChange(path, selectedNodes.map(selectedNode => selectedNode.id))
        }

        return (
            <div className="p-grid">
                <div className="p-col-sm-6 p-md-8">
                    <CheckboxSVGMap map={Map} onChange={handleNodesSelections}/>
                </div>
                <div className="p-col-sm-6 p-md-4">
                    <div className="p-inputgroup p-field">
                        <span className="p-float-label">
                              <AutoComplete inputId={id} id={id + '-selected'} value={data} multiple
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
