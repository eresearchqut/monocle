import {VerticalFormBuilder} from "./verticalFormBuilder";
import FormBuilder from "../interfaces/formBuilder";
import {Form} from "../../../form-definition";

export {
    FormBuilder
};


export const formBuilders: FormBuilder[] = [new VerticalFormBuilder()];

export const findFormBuilder = (form: Form): FormBuilder | undefined => formBuilders[0];
