export type Form = UniquelyIdentifiable &
    Named & {
    sections: Section[];
};

export type Section = UniquelyIdentifiable &
    Named & {
    inputs: Input[];
};

export type Input = UniquelyIdentifiable & Named & InputType;
export type InputType = FreeTextInput;
export type FreeTextInput = Requireable & {
    /**
     * The maximum length of the input field
     */
    maxLength?: number;
    /**
     * The minimum length of the input field
     */
    minLength?: number;
    /**
     * Is this a multiline input that supports carriage returns (new lines)
     */
    multiline?: boolean;
};

export interface UniquelyIdentifiable {
    /**
     * The id of the element
     */
    id: string;
}

export interface Named {
    /**
     * The name of the element
     */
    name: string;
}

export interface Requireable {
    /**
     * Is this element required
     */
    required: boolean;
}

