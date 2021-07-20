import {UniquelyIdentifiable} from "./uniquelyIdentifiable";
import {Named} from "./named";

export enum InputType {
    TEXT = 'Text',
    NUMERIC = 'Numeric'
}

export interface Input extends UniquelyIdentifiable, Named {
    inputType: InputType
}



