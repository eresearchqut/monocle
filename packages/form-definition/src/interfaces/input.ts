import {Named} from "./named";

export interface InputType extends Named {
    inputType: 'text' | 'numeric'
}

export interface TextInput extends InputType {
    inputType: 'text',
    required?: boolean,
    minLength?: number,
    maxLength?: number
}

export interface NumericInput extends InputType {
    inputType: 'numeric',
    required?: boolean | false,
    minimum?: number,
    maximum?: number,
    multipleOf?: number
    increment?: number
}


export type Input = TextInput | NumericInput;



