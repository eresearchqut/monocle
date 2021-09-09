import {TextInputCompiler} from "./textInputCompiler";
import {NumericInputCompiler} from "./numericInputCompiler";
import {CurrencyInputCompiler} from "./currencyInputCompiler";
import InputCompiler from "../interfaces/inputCompiler";
import {Form, Input, Section} from "@trrf/form-definition";
import {BooleanInputCompiler} from "./booleanInputCompiler";
import {DateInputCompiler} from "./dateInputCompiler";
import {AbstractInputCompiler} from "./abstractInputCompiler";

export {
    AbstractInputCompiler,
    TextInputCompiler,
    NumericInputCompiler,
    CurrencyInputCompiler,
    BooleanInputCompiler,
    DateInputCompiler
};

export const inputCompilers: InputCompiler[] = [new TextInputCompiler(), new NumericInputCompiler(), new CurrencyInputCompiler(), new BooleanInputCompiler(), new DateInputCompiler()]

export const findInputCompiler = (form: Form, section: Section, input: Input): InputCompiler | undefined => inputCompilers
    .find((inputBuilder) => inputBuilder.supports(form, section, input));

