import {Named} from './named';
import {Requireable} from './requireable';
import {Typed} from './typed';
import {Described} from './described';
import {Labelled} from "./labeled";
import {UniquelyIdentifiable} from "./uniquelyIdentifiable";


export interface InputType extends UniquelyIdentifiable, Named, Requireable, Typed, Described, Labelled {
    type: 'text' | 'numeric' | 'currency' | 'boolean' | 'date' | 'time' | 'date-time' | 'email' | 'svg-map'
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
    multiline?: boolean,
    regularExpression?: string
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
 * @title Numeric
 */
export interface NumericInput extends InputType {
    type: 'numeric',
    minimum?: number,
    maximum?: number,

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
 * @title Currency
 */
export interface CurrencyInput extends InputType {
    type: 'currency',
    currencyCode: string,
    currencyDisplay?: 'symbol' | 'name',
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
export type Input = TextInput | NumericInput | CurrencyInput | BooleanInput | DateInput | SvgMapInput;
