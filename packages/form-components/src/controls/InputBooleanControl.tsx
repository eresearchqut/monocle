import React, {Fragment} from 'react';
import {ControlProps, ControlState, isBooleanControl, NOT_APPLICABLE, RankedTester, rankWith} from '@jsonforms/core';
import {Control, DispatchCell, withJsonFormsControlProps} from '@jsonforms/react';

import maxBy from 'lodash/maxBy';
import merge from "lodash/merge";

export class InputBooleanControl extends Control<ControlProps, ControlState> {
    render() {

        const {
            schema,
            id,
            label,
            uischema,
            visible,
            path,
            cells,
            config
        } = this.props;

        if (!visible) {
            return null;
        }


        const appliedUiSchemaOptions = merge({}, config, uischema.options);
        const {description} = appliedUiSchemaOptions;
        const cell = maxBy(cells, r => r.tester(uischema, schema));

        if (cell === undefined || cell.tester(uischema, schema) === NOT_APPLICABLE) {
            return null;
        }

        const dispatchCell = (<DispatchCell
            uischema={uischema}
            schema={schema}
            path={path}
            cells={cells}
            id={id}
        />)


        return (
            <Fragment>
                <div className="p-field-checkbox">
                    {dispatchCell}
                    <label htmlFor={id} id={id + '-label'} className="p-checkbox-label">{label}</label>
                </div>
                { description &&
                <div className="p-text-light p-mb-2">{description}</div>
                }
            </Fragment>
        )

    }
}

export const inputBooleanControlTester: RankedTester = rankWith(2, isBooleanControl);
export default withJsonFormsControlProps(InputBooleanControl);
