import {TextInputBuilder} from "./textInputBuilder";
import {NumericInputBuilder} from "./numericInputBuilder";
import {CurrencyInputBuilder} from "./cutrrencyInputBuilder";
import InputBuilder from "../interfaces/inputBuilder";
import {Form, Input, Section} from "@trrf/form-definition";
import {BooleanInputBuilder} from "./booleanInputBuilder";

export {
    TextInputBuilder,
    NumericInputBuilder,
    CurrencyInputBuilder,
    BooleanInputBuilder
};

export const inputBuilders: InputBuilder[] = [new TextInputBuilder(), new NumericInputBuilder(), new CurrencyInputBuilder(), new BooleanInputBuilder()]

export const findInputBuilder = (form: Form, section: Section, input: Input): InputBuilder | undefined => inputBuilders
    .find((inputBuilder) => inputBuilder.supports(form, section, input));


