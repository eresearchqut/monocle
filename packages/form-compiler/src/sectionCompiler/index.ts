import { CategorySectionCompiler } from './categorySectionCompiler';
import { AbstractSectionCompiler } from './abstractSectionCompiler';
import SectionCompiler from '../interfaces/sectionCompiler';
import { Form, Section } from '../../../form-definition';

export { SectionCompiler, AbstractSectionCompiler, CategorySectionCompiler };

export const sectionCompilers: SectionCompiler[] = [new CategorySectionCompiler()];

export const findSectionCompiler = (form: Form, section: Section): SectionCompiler | undefined =>
    form && section ? sectionCompilers[0] : undefined;
