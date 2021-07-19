import {UniquelyIdentifiable} from "./uniquelyIdentifiable";
import {Named} from "./named";
import {Input} from "./input";

export interface Section extends UniquelyIdentifiable, Named {
    inputs: Input[];
};





