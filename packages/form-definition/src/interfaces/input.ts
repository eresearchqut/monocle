import {Named} from "./named";

export interface InputType extends Named {
    inputType: 'text' | 'numeric'
}

/**
 * @title Text
 */
export interface TextInput extends InputType {
    inputType: 'text',
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    multiline?: boolean
}

/**
 * @title Numeric
 */
export interface NumericInput extends InputType {
    inputType: 'numeric',
    required?: boolean | false,
    minimum?: number,
    maximum?: number,
    multipleOf?: number
    increment?: number
}


/**
 * @title Input
 */
export type Input = TextInput | NumericInput;



