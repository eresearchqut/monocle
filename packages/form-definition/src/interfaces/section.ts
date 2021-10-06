import {Named} from './named';
import {Input, InputType} from './input';
import {Labelled} from "./labeled";
import {Described} from "./described";
import {UniquelyIdentifiable} from "./uniquelyIdentifiable";
import {Typed} from "./typed";

export interface SectionType extends UniquelyIdentifiable, Named, Typed, Described, Labelled {
    type: 'default',
    inputs: Input[];
}


export interface DefaultSection extends SectionType {
    type: 'default'
}


/**
 * @title Section
 */
export type Section = DefaultSection;
