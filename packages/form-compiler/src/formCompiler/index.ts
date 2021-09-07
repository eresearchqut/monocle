import {VerticalFormCompiler} from "./verticalFormCompiler";
import {AbstractFormCompiler} from "./abstractFormCompiler";
import FormCompiler from "../interfaces/formCompiler";
import {Form} from "../../../form-definition";

export {
    FormCompiler, AbstractFormCompiler, VerticalFormCompiler
};


export const formCompilers: FormCompiler[] = [new VerticalFormCompiler()];

export const findFormCompiler = (form: Form): FormCompiler | undefined => formCompilers[0];
