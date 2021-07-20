import {TextInputBuilder} from "./textInputBuilder";
import InputBuilder from "../interfaces/inputBuilder";
import {Form, Input, Section} from "@trrf/form-definition";

export {
    TextInputBuilder
};

export const inputBuilders: InputBuilder[] = [new TextInputBuilder()]

export const findInputBuilder = (form: Form, section: Section, input: Input): InputBuilder | undefined => inputBuilders
    .find((inputBuilder) => inputBuilder.supports(form, section, input));


