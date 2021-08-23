import {TextInputBuilder} from "./textInputBuilder";
import {NumericInputBuilder} from "./numericInputBuilder";
import {CurrencyInputBuilder} from "./cutrrencyInputBuilder";
import InputBuilder from "../interfaces/inputBuilder";
import {Form, Input, Section} from "@trrf/form-definition";
import {BooleanInputBuilder} from "./booleanInputBuilder";
import {DateInputBuilder} from "./dateInputBuilder";
import {AbstractInputBuilder} from "./abstractInputBuilder";

export {
    AbstractInputBuilder,
    TextInputBuilder,
    NumericInputBuilder,
    CurrencyInputBuilder,
    BooleanInputBuilder,
    DateInputBuilder
};

export const inputBuilders: InputBuilder[] = [new TextInputBuilder(), new NumericInputBuilder(), new CurrencyInputBuilder(), new BooleanInputBuilder(), new DateInputBuilder()]

export const findInputBuilder = (form: Form, section: Section, input: Input): InputBuilder | undefined => inputBuilders
    .find((inputBuilder) => inputBuilder.supports(form, section, input));


