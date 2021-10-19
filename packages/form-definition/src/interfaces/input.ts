import {Named} from './named';
import {Requireable} from './requireable';
import {Typed} from './typed';
import {Described} from './described';
import {Labelled} from "./labeled";
import {UniquelyIdentifiable} from "./uniquelyIdentifiable";

export enum InputType {
    BOOLEAN = 'boolean',
    CURRENCY = 'currency',
    DATE = 'date',
    DATE_TIME = 'date-time',
    MARKDOWN = 'markdown',
    MULTILINE_TEXT = 'multiline-text',
    NUMERIC = 'numeric',
    OPTION = 'option',
    RANGE = 'range',
    SVG_MAP = 'svg-map',
    TEXT = 'text',
    TIME = 'time'
}


export interface AbstractInput extends Typed<InputType>, Named, UniquelyIdentifiable, Described, Labelled, Requireable {

}

export interface Option<T> {
    label: string,
    value: T
}

export interface OptionInput extends AbstractInput {
    type: InputType.OPTION;
    /**
     * Can multiple options be selected
     */
    multiselect: boolean,
    /**
     * Are options displayed at all times, single select radio, multiselect checklist
     */
    displayOptions: boolean,
    /**
     * @TJS-minItems 1
     */
    options: Option<string>[];
}


/**
 * @title Boolean
 */
export interface BooleanInput extends AbstractInput {
    type: InputType.BOOLEAN
}



/**
 * @title Text
 */
export interface TextInput extends AbstractInput {
    type: InputType.TEXT
    minLength?: number,
    maxLength?: number,
    pattern?: string
}

/**
 * @title Multiline Text
 */
export interface MultilineTextInput extends AbstractInput {
    type: InputType.MULTILINE_TEXT
    minLength?: number,
    maxLength?: number,
}

/**
 * @title Markdown
 */
export interface MarkdownInput extends AbstractInput {
    type: InputType.MARKDOWN
}

/**
 * @title Date
 */
export interface DateInput extends AbstractInput {
    type: InputType.DATE

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
export interface TimeInput extends AbstractInput {
    type: InputType.TIME,
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
     *    Seconds to change per step.
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
export interface DateTimeInput extends AbstractInput {
    type: InputType.DATE_TIME,

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
     *    Seconds to change per step.
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
export interface NumericInput extends AbstractInput {
    type: InputType.NUMERIC,
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
export interface RangeInput extends AbstractInput {
    type: InputType.RANGE,
    minimum?: number,
    maximum?: number,
    increment?: number
}

/**
 * @title Currency
 */
export interface CurrencyInput extends AbstractInput {
    type: InputType.CURRENCY,
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
export interface SvgMapInput extends AbstractInput {
    type: InputType.SVG_MAP,
    map: 'body' | 'painScale',
    multiselect?: boolean
}

/**
 * @title Input
 */
export type Input = TextInput | MultilineTextInput | NumericInput | OptionInput | RangeInput | CurrencyInput | BooleanInput
    | DateInput | TimeInput | DateTimeInput | SvgMapInput | MarkdownInput;
