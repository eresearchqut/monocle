import {Named} from './named';
import {Requireable} from './requireable';
import {Typed} from './typed';
import {Described} from './described';
import {Labelled} from "./labeled";
import {UniquelyIdentifiable} from "./uniquelyIdentifiable";


export interface InputType extends UniquelyIdentifiable, Named, Requireable, Typed, Described, Labelled {
    type: 'text' | 'multiline-text' | 'numeric' | 'range' | 'currency' | 'boolean' | 'date' | 'time' | 'date-time' | 'email' | 'svg-map'
}

/**
 * @title Boolean
 */
export interface BooleanInput extends InputType {
    type: 'boolean'
}

/**
 * @title Text
 */
export interface TextInput extends InputType {
    type: 'text',
    minLength?: number,
    maxLength?: number,
    pattern?: string
}

/**
 * @title Multiline Text
 */
export interface MultilineTextInput extends InputType {
    type: 'multiline-text',
    minLength?: number,
    maxLength?: number,
}

/**
 * @title Date
 */
export interface DateInput extends InputType {
    type: 'date',

    /**
     * @TJS-format date
     */
    minimum?: string,

    /**
     * @TJS-format date
     */
    maximum?: string
}


/**
 * @title Time
 */
export interface TimeInput extends InputType {
    type: 'time',
    /**
     * 24 or 12 hour time
     */
    hourFormat?: '24' | '12',
    /**
     * Display seconds controls
     */
    includeSeconds?: boolean,
    /**
     * Display millisecond controls
     */
    includeMilliseconds?: boolean
    /**
     * Hours to change per step.
     */
    stepHours?: number
    /**
     * Minutes to change per step
     */
    stepMinutes?: number
    /**
     * 	Seconds to change per step.
     */
    stepSeconds?: number
    /**
     * Milliseconds to change per step.
     */
    stepMilliseconds?: number
}

/**
 * @title Date Time
 */
export interface DateTimeInput extends InputType {
    type: 'date-time',

    /**
     * 24 or 12 hour time
     */
    hourFormat?: '24' | '12',
    /**
     * Display seconds controls
     */
    includeSeconds?: boolean,
    /**
     * Display millisecond controls
     */
    includeMilliseconds?: boolean
    /**
     * Hours to change per step.
     */
    stepHours?: number
    /**
     * Minutes to change per step
     */
    stepMinutes?: number
    /**
     * 	Seconds to change per step.
     */
    stepSeconds?: number
    /**
     * Milliseconds to change per step.
     */
    stepMilliseconds?: number

    /**
     * @TJS-format date
     */
    minimum?: string,

    /**
     * @TJS-format date
     */
    maximum?: string
}

/**
 * @title Numeric
 */
export interface NumericInput extends InputType {
    type: 'numeric',
    minimum?: number,
    maximum?: number,
    locale?: string,

    /**
     * @minimum 0
     * @TJS-type integer
     */
    decimalPlaces?: number,
    increment?: number,

    /**
     * @description Whether to use grouping separators, such as thousands separators
     */
    groupNumbers?: boolean
}

/**
 * @title Range
 */
export interface RangeInput extends InputType {
    type: 'range',
    minimum?: number,
    maximum?: number,
    increment?: number
}

/**
 * @title Currency
 */
export interface CurrencyInput extends InputType {
    type: 'currency',
    currencyCode: string,
    currencyDisplay?: 'symbol' | 'name',
    locale?: string,
    minimum?: number,
    maximum?: number
}


/**
 * @title Svg Map
 *
 */
export interface SvgMapInput extends InputType {
    type: 'svg-map',
    map: 'body' | 'painScale',
    multiselect?: boolean
}

/**
 * @title Input
 */
export type Input = TextInput | MultilineTextInput | NumericInput | RangeInput | CurrencyInput | BooleanInput | DateInput | TimeInput | DateTimeInput | SvgMapInput;
