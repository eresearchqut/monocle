import {Named} from "./named";
import {Requireable} from "./requireable";

export interface InputType extends Named, Requireable {
    inputType: 'text' | 'numeric' | 'currency' | 'boolean'
}

/**
 * @title Boolean
 */
export interface BooleanInput extends InputType {
    inputType: 'boolean'
}



/**
 * @title Text
 */
export interface TextInput extends InputType {
    inputType: 'text',
    minLength?: number,
    maxLength?: number,
    multiline?: boolean
}



/**
 * @title Numeric
 */
export interface NumericInput extends InputType {
    inputType: 'numeric',
    minimum?: number,
    maximum?: number,
    /**
     * @minimum 0
     * @TJS-type integer
     */
    decimalPlaces?: number,
    increment?: number
}

/**
 * @title Currency
 */
export interface CurrencyInput extends InputType {
    inputType: 'currency',
    currencyCode: string,
    currencyDisplay?: 'symbol' | 'name',
    locale: string
    minimum?: number,
    maximum?: number
}

/**
 * @title Input
 */
export type Input = TextInput | NumericInput | CurrencyInput | BooleanInput;


