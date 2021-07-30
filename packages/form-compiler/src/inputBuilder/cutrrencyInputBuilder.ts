import {InputBuilder} from "../interfaces";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Input, CurrencyInput, Section} from "@trrf/form-definition";
import {AbstractInputBuilder} from "./abstractInputBuilder";


export class CurrencyInputBuilder extends AbstractInputBuilder implements InputBuilder {

    supports(form: Form, section: Section, input: Input): boolean {
        return input.inputType === 'currency';
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const {maximum, minimum} = input as CurrencyInput;
        return {type: "number", maximum, minimum} as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        const {currencyCode, currencyDisplay, locale} = input as CurrencyInput;
        return this.uiControl(form, section, input,  {
            currencyCode,
            currencyDisplay,
            locale
        });

    }
}

