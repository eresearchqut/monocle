import {Named} from "./named";
import {Requireable} from "./requireable";
import {Typed} from "./typed";


export interface InputType extends Named, Requireable, Typed {
    type: 'text' | 'numeric' | 'currency' | 'boolean' | 'date' | 'time' | 'date-time' | 'email' | 'image-map'
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


export interface Rgba {
    /**
     * @minimum 0
     * @maximum 255
     * @default 0
     * @TJS-type integer
     */
    red: number
    /**
     * @minimum 0
     * @maximum 255
     * @default 0
     * @TJS-type integer
     */
    green: number
    /**
     * @minimum 0
     * @maximum 255
     * @default 0
     * @TJS-type integer
     */
    blue: number
    /**
     * @minimum 0
     * @maximum 1
     * @default 1
     */
    opacity: number
}

/**
 * @title Image Area
 */
export interface ImageArea {
    /**
     * @description Uniquely identify an area.
     */
    id?: string
    /**
     * 	@description Either rect, circle or poly
     */
    shape: 'rect' | 'circle' | 'poly'
    /**
     * @description Coordinates delimiting the zone according to the specified shape:
     * rect: top-left-X,top-left-Y,bottom-right-X,bottom-right-Y
     * circle: center-X,center-Y,radius
     * poly: Every point in the polygon path as point-X,point-Y,...
     *
     */
    coords: number[]

    /**
     * @description Enable/Disable area listeners and highlighting
     */
    disabled?: boolean

    /**
     * @description	Target link for a click in the zone (note that if you provide an onClick prop, href will be prevented)
     */
    href?: string

    /**
     * @description Fill color of the highlighted zone
     */
    fillColor?: Rgba

    /**
     * @description Border color of the highlighted zone
     */
    strokeColor?: number

    /**
     * @description Pre filled color of the highlighted zone
     */
    preFillColor?: Rgba
}

/**
 * @title Image Map
 *
 */
export interface ImageMapInput extends InputType {
    type: 'image-map'
    /**
     * @format uri
     */
    image: string
    areas: ImageArea[]
}

/**
 * @title Input
 */
export type Input = TextInput | NumericInput | CurrencyInput | BooleanInput | DateInput | ImageMapInput;


