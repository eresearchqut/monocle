import {Named} from './named';
import {Input} from './input';
import {Labelled} from "./labeled";
import {Described} from "./described";
import {UniquelyIdentifiable} from "./uniquelyIdentifiable";

/**
 * @title Section
 */
export interface Section extends UniquelyIdentifiable, Named, Labelled, Described {
    inputs: Input[];
}
