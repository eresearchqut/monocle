import {UniquelyIdentifiable} from "./uniquelyIdentifiable";
import {Named} from "./named";

export interface Input extends UniquelyIdentifiable, Named {
    inputType: string
}



