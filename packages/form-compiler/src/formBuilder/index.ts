import {VerticalFormBuilder} from "./verticalFormBuilder";
import {AbstractFormBuilder} from "./abstractFormBuilder";
import FormBuilder from "../interfaces/formBuilder";
import {Form} from "../../../form-definition";

export {
    FormBuilder, AbstractFormBuilder, VerticalFormBuilder
};


export const formBuilders: FormBuilder[] = [new VerticalFormBuilder()];

export const findFormBuilder = (form: Form): FormBuilder | undefined => formBuilders[0];
