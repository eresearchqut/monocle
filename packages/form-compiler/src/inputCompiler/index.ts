import {TextInputCompiler} from './textInputCompiler';
import {NumericInputCompiler} from './numericInputCompiler';
import {RangeInputCompiler} from './rangeInputCompiler';
import {CurrencyInputCompiler} from './currencyInputCompiler';
import InputCompiler from '../interfaces/inputCompiler';
import {Form, Input, Section} from '@trrf/form-definition';
import {BooleanInputCompiler} from './booleanInputCompiler';
import {CalendarInputCompiler} from './calendarInputCompiler';
import {AbstractInputCompiler} from './abstractInputCompiler';
import {SvgMapInputCompiler} from './svgMapInputCompiler';
import {MultilineTextInputCompiler} from './multilineTextInputCompiler';

export {
  AbstractInputCompiler,
  TextInputCompiler,
  NumericInputCompiler,
  RangeInputCompiler,
  CurrencyInputCompiler,
  BooleanInputCompiler,
  CalendarInputCompiler,
};

export const inputCompilers: InputCompiler[] = [new RangeInputCompiler(), new TextInputCompiler(), new MultilineTextInputCompiler(), new NumericInputCompiler(), new CurrencyInputCompiler(), new BooleanInputCompiler(), new CalendarInputCompiler(), new SvgMapInputCompiler()];

export const findInputCompiler = (form: Form, section: Section, input: Input): InputCompiler | undefined => inputCompilers
    .find((inputBuilder) => inputBuilder.supports(form, section, input));


