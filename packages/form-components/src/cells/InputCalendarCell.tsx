import React from 'react';
import {
    CellProps,
    isDateControl,
    isDateTimeControl,
    isTimeControl,
    or,
    RankedTester,
    rankWith,
} from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';

import isEmpty from 'lodash/isEmpty';
import { Calendar, CalendarChangeParams } from 'primereact/calendar';
import merge from 'lodash/merge';

export interface InputDateCellOptions {
    locale?: string;
    hideCalendarIcon?: boolean;
    /**
     * 24 or 12 hour time
     */
    hourFormat?: '24' | '12';
    /**
     * Display seconds controls
     */
    includeSeconds?: boolean;
    /**
     * Display millisecond controls
     */
    includeMilliseconds?: boolean;
    /**
     * Hours to change per step.
     */
    stepHours?: number;
    /**
     * Minutes to change per step
     */
    stepMinutes?: number;
    /**
     *    Seconds to change per step.
     */
    stepSeconds?: number;
    /**
     * Milliseconds to change per step.
     */
    stepMilliseconds?: number;
}

export const InputCalendarCell = (props: CellProps) => {
    const {
        config,
        data,
        id,
        schema,
        uischema,
        path,
        handleChange,
        visible = true,
        isValid = true,
        enabled = true,
    } = props;

    if (!visible) {
        return null;
    }

    const { format } = schema;
    const className = isValid ? undefined : 'p-invalid';
    const {
        locale,
        hideCalendarIcon,
        hourFormat,
        includeSeconds,
        includeMilliseconds,
        stepHours,
        stepMinutes,
        stepSeconds,
        stepMilliseconds,
    } = merge({}, config, uischema.options) as InputDateCellOptions;

    const onChange = (e: CalendarChangeParams) => {
        const dateValue = e.value;
        if (dateValue instanceof Date) {
            if (format === 'date') {
                const offset = dateValue.getTimezoneOffset() * 60 * 1000;
                const localDate = dateValue.getTime() - offset;
                const localIso = new Date(localDate).toISOString();
                handleChange(path, localIso.split('T')[0]);
            } else {
                if (!includeSeconds) {
                    dateValue.setSeconds(0);
                }
                if (!includeMilliseconds) {
                    dateValue.setMilliseconds(0);
                }
                const isoDateTime = dateValue.toISOString();
                if (format === 'time') {
                    handleChange(path, isoDateTime.split('T')[1]);
                } else {
                    handleChange(path, isoDateTime);
                }
            }
        } else {
            const calendarTextInput: HTMLInputElement = document.getElementById(id) as HTMLInputElement;
            if (isEmpty(calendarTextInput.value)) {
                handleChange(path, undefined);
            }
        }
    };

    const value = (data: string | undefined): Date | undefined => {
        if (data) {
            if (format === 'time') {
                return new Date(`2021-01-01T${data}`);
            }
            return new Date(data);
        }
        return undefined;
    };

    const dateFormat = new Intl.DateTimeFormat(locale)
        .formatToParts(new Date())
        .map((obj) => {
            switch (obj.type) {
                case 'day':
                    return 'dd';
                case 'month':
                    return 'mm';
                case 'year':
                    return 'yy';
                default:
                    return obj.value;
            }
        })
        .join('');

    const timeOnly = format === 'time';
    const showTime = format !== 'date';

    return (
        <Calendar
            id={id}
            value={value(data)}
            showTime={showTime}
            timeOnly={timeOnly}
            dateFormat={dateFormat}
            showIcon={!hideCalendarIcon}
            disabled={!enabled}
            showSeconds={includeSeconds}
            showMillisec={includeMilliseconds}
            stepHour={stepHours}
            stepMinute={stepMinutes}
            stepSecond={stepSeconds}
            stepMillisec={stepMilliseconds}
            hourFormat={hourFormat}
            className={className}
            onChange={onChange}
        />
    );
};

/**
 * Default tester for date controls.
 * @type {RankedTester}
 */
export const inputCalendarCellTester: RankedTester = rankWith(2, or(isDateControl, isTimeControl, isDateTimeControl));

export default withJsonFormsCellProps(InputCalendarCell);
