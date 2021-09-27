import {CategorizationFormCompiler} from './categorizationFormCompiler';
import {AbstractFormCompiler} from './abstractFormCompiler';
import FormCompiler from '../interfaces/formCompiler';
import {Form} from '@trrf/form-definition';

export {
  FormCompiler, AbstractFormCompiler, CategorizationFormCompiler,
};


export const formCompilers: FormCompiler[] = [new CategorizationFormCompiler()];

export const findFormCompiler = (form: Form): FormCompiler | undefined => form ? formCompilers[0] : undefined;
