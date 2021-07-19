import {UniquelyIdentifiable} from "./uniquelyIdentifiable";
import {Named} from "./named";
import {Section} from "./section";

export interface Form extends UniquelyIdentifiable, Named {
    sections: Section[];
};







