import React from 'react';
import {
    CellProps, isBooleanControl, isDateControl,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';


import isEmpty from "lodash/isEmpty";
import {Calendar} from "primereact/calendar";
import merge from "lodash/merge";

export const InputDateCell = (props: CellProps) => {

    const {
        config,
        data,
        id,
        enabled,
        uischema,
        path,
        handleChange,
        errors
    } = props;

    const appliedUiSchemaOptions = merge({}, config, uischema.options);
    const className = errors.length === 0 ? undefined : 'p-invalid';
    const {locale} = appliedUiSchemaOptions || 'en-AU';

    const parseDate = (dateValue: Date | Date[] | undefined) => {
        if (dateValue instanceof Date) {
            let offset = dateValue.getTimezoneOffset() * 60 * 1000;
            let localDate = dateValue.getTime() - offset;
            let localIso = new Date(localDate).toISOString().split('T')[0];
            handleChange(path, localIso);
        } else {
            const calendarTextInput: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
            if (isEmpty(calendarTextInput.value)) {
                handleChange(path, undefined);
            }
        }
    }


    const localDateFormat = () => {
        const formatObj = new Intl.DateTimeFormat(locale).formatToParts(new Date());
        return formatObj
            .map(obj => {
                switch (obj.type) {
                    case "day":
                        return "dd";
                    case "month":
                        return "mm";
                    case "year":
                        return "yy";
                    default:
                        return obj.value;
                }
            })
            .join("");
    }



    return (
        <Calendar
            dateFormat={localDateFormat()}
            disabled={!enabled}
            id={id}
            value={data ? new Date(data) : undefined}
            className={className}
            onChange={(e) => parseDate(e.value)} />
    );

};

/**
 * Default tester for date controls.
 * @type {RankedTester}
 */
export const inputDateCellTester: RankedTester = rankWith(2, isDateControl);

export default withJsonFormsCellProps(InputDateCell);
