import {Named} from './named';
import {Input} from './input';
import {Labelled} from "./labeled";
import {Described} from "./described";

/**
 * @title Section
 */
export interface Section extends Named, Labelled, Described {
    inputs: Input[];
}
