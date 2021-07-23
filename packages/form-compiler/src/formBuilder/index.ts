import {VerticalFormBuilder} from "./verticalFormBuilder";
import FormBuilder from "../interfaces/sectionBuilder";
import {Form, Section,} from "../../../form-definition";
import SectionBuilder from "../interfaces/sectionBuilder";



export {
    FormBuilder
};


export const formBuilders: FormBuilder[] = [new VerticalFormBuilder()];

export const findFormBuilder = (form: Form): SectionBuilder | undefined => formBuilders[0];
