import { Named } from './named';

import { Labelled } from './labeled';
import { Described } from './described';
import { UniquelyIdentifiable } from './uniquelyIdentifiable';
import { Typed } from './typed';
import { Input } from './input';

export enum SectionType {
    DEFAULT = 'default',
}

export interface AbstractSection extends Typed<SectionType>, Named, UniquelyIdentifiable, Described, Labelled {
    inputs: Input[];
}

export interface DefaultSection extends AbstractSection {
    type: SectionType.DEFAULT;
}

/**
 * @title Section
 */
export type Section = DefaultSection;
