import React from 'react';
import {ControlProps, ControlState, isBooleanControl, NOT_APPLICABLE, RankedTester, rankWith} from '@jsonforms/core';
import {Control, DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';
import ImageMapper, {CustomArea} from 'react-img-mapper';

import merge from "lodash/merge";

export class ImageMapControl extends Control<ControlProps, ControlState> {
    render() {

        const {
            schema,
            id,
            label,
            uischema,
            visible,
            path,
            handleChange,
            config
        } = this.props;

        const appliedUiSchemaOptions = merge({}, config, uischema.options);


        const {areas, image} = appliedUiSchemaOptions || {};
        const map =  {
            name: 'my-map',
            areas
        }


        const onClick = (area: CustomArea) => handleChange(path, area.id);




        return (
            <div style={{width: '900px'}}>
                <ImageMapper src={image} map={map} onClick={onClick} stayHighlighted/>
            </div>
        )

    }
}

export const imageMapControlTester: RankedTester = rankWith(2, isBooleanControl);
export default withJsonFormsControlProps(ImageMapControl);
