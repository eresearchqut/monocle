import {Named} from './named';
import {Input} from './input';

/**
 * @title Section
 */
export interface Section extends Named {
    inputs: Input[];
}
