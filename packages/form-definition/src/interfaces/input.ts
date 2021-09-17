import {Named} from "./named";
import {Requireable} from "./requireable";
import {Typed} from "./typed";


export interface InputType extends Named, Requireable, Typed {
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
    multiline?: boolean
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
 * @title Image Map
 *
 */
export interface SvgMapInput extends InputType {
    type: 'svg-map'
    /**
     * @format uri
     */
    map: string,
    multiselect?: boolean
}

/**
 * @title Input
 */
export type Input = TextInput | NumericInput | CurrencyInput | BooleanInput | DateInput | SvgMapInput;


