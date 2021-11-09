import {Named} from './named';
import {Section} from './section';
import {Labelled} from './labeled';
import {Described} from './described';

/**
 * @title Form
 */
export interface Form extends Named, Labelled, Described {
    sections: Section[];
}
