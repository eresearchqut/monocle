import { Form, Input, Section } from '@eresearchqut/form-definition';
import InputCompiler from '../interfaces/inputCompiler';
import { AddressInputCompiler } from './addressInputCompiler';
import { CaptchaInputCompiler } from './captchaInputCompiler';
import { EmailInputCompiler } from './emailInputCompiler';
import { TextInputCompiler } from './textInputCompiler';
import { NumericInputCompiler } from './numericInputCompiler';
import { RangeInputCompiler } from './rangeInputCompiler';
import { CurrencyInputCompiler } from './currencyInputCompiler';
import { CountryInputCompiler } from './countryInputCompiler';
import { BooleanInputCompiler } from './booleanInputCompiler';
import { DateTimeInputCompiler } from './dateTimeInputCompiler';
import { AbstractInputCompiler } from './abstractInputCompiler';
import { SvgMapInputCompiler } from './svgMapInputCompiler';
import { MultilineTextInputCompiler } from './multilineTextInputCompiler';
import { MarkdownInputCompiler } from './markdownInputCompiler';
import { OptionsInputCompiler } from './optionsInputCompiler';
import { SignatureInputCompiler } from './signatureInputCompiler';
import { SampleContainerInputCompiler } from './sampleContainerInputCompiler';
import { QRScannerInputCompiler } from './qrScannerInputCompiler';

export {
    AbstractInputCompiler,
    AddressInputCompiler,
    CaptchaInputCompiler,
    EmailInputCompiler,
    TextInputCompiler,
    MarkdownInputCompiler,
    NumericInputCompiler,
    RangeInputCompiler,
    OptionsInputCompiler,
    CountryInputCompiler,
    CurrencyInputCompiler,
    BooleanInputCompiler,
    DateTimeInputCompiler,
    SignatureInputCompiler,
    QRScannerInputCompiler,
    SampleContainerInputCompiler,
};

export const inputCompilers: InputCompiler[] = [
    new AddressInputCompiler(),
    new CaptchaInputCompiler(),
    new EmailInputCompiler(),
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
    new QRScannerInputCompiler(),
    new SampleContainerInputCompiler(),
    new SvgMapInputCompiler(),
    new SignatureInputCompiler(),
];

export const findInputCompiler = (form: Form, section: Section, input: Input): InputCompiler | undefined =>
    inputCompilers.find((inputBuilder) => inputBuilder.supports(form, section, input));
