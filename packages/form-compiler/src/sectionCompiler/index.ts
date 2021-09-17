import {VerticalSectionCompiler} from './verticalSectionCompiler';
import {AbstractSectionCompiler} from './abstractSectionCompiler';
import SectionCompiler from '../interfaces/sectionCompiler';
import {Form, Section} from '../../../form-definition';

export {
  SectionCompiler, AbstractSectionCompiler, VerticalSectionCompiler,
};

export const sectionCompilers: SectionCompiler[] = [new VerticalSectionCompiler()];

export const findSectionCompiler = (form: Form, section: Section): SectionCompiler | undefined => sectionCompilers[0];
