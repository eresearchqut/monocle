import {AddressInputCompiler} from './addressInputCompiler';
import {TextInputCompiler} from './textInputCompiler';
import {NumericInputCompiler} from './numericInputCompiler';
import {RangeInputCompiler} from './rangeInputCompiler';
import {CurrencyInputCompiler} from './currencyInputCompiler';
import {CountryInputCompiler} from './countryInputCompiler';

import InputCompiler from '../interfaces/inputCompiler';
import {Form, Input, Section} from '@trrf/form-definition';
import {BooleanInputCompiler} from './booleanInputCompiler';
import {DateTimeInputCompiler} from './dateTimeInputCompiler';
import {AbstractInputCompiler} from './abstractInputCompiler';
import {SvgMapInputCompiler} from './svgMapInputCompiler';
import {MultilineTextInputCompiler} from './multilineTextInputCompiler';
import {MarkdownInputCompiler} from "./markdownInputCompiler";
import {OptionsInputCompiler} from './optionsInputCompiler';
import {SignatureInputCompiler} from './signatureInputCompiler';

export {
    AbstractInputCompiler,
    AddressInputCompiler,
    TextInputCompiler,
    MarkdownInputCompiler,
    NumericInputCompiler,
    RangeInputCompiler,
    OptionsInputCompiler,
    CountryInputCompiler,

    CurrencyInputCompiler,
    BooleanInputCompiler,
    DateTimeInputCompiler,
    SignatureInputCompiler
};

export const inputCompilers: InputCompiler[] = [
    new AddressInputCompiler(),
    new RangeInputCompiler(),
    new TextInputCompiler(),
    new MultilineTextInputCompiler(),
    new MarkdownInputCompiler(),
    new NumericInputCompiler(),
    new OptionsInputCompiler(),
    new CurrencyInputCompiler(),
    new CountryInputCompiler(),
    new BooleanInputCompiler(),
    new DateTimeInputCompiler(),
    new SvgMapInputCompiler(),
    new SignatureInputCompiler()
];

export const findInputCompiler = (form: Form, section: Section, input: Input): InputCompiler | undefined => inputCompilers
    .find((inputBuilder) => inputBuilder.supports(form, section, input));