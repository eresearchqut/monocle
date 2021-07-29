import {InputBuilder} from "../interfaces";
import {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {Form, Input, Section} from "@trrf/form-definition";
import {AbstractInputBuilder} from "./abstractInputBuilder";
import {TextInput} from "@trrf/form-definition/dist/interfaces";

export class TextInputBuilder extends AbstractInputBuilder implements InputBuilder {

    supports(form: Form, section: Section, input: Input): boolean {
        return input.inputType === 'numeric';
    }

    schema(form: Form, section: Section, input: Input): JsonSchema {
        const {maxLength, minLength} = input as TextInput;
        return {type: "string", maxLength, minLength} as JsonSchema;
    }

    ui(form: Form, section: Section, input: Input): UISchemaElement | undefined {
        const {multiline} = input as TextInput;
        const uiControl = this.uiControl(form, section, input);
        if (uiControl  && multiline) {
            return {
                ...uiControl,
                options: {
                    multi: true
                }
            }
        }
        return uiControl;
    }
}

