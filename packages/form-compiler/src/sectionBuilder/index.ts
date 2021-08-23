import {VerticalSectionBuilder} from "./verticalSectionBuilder";
import {AbstractSectionBuilder} from "./abstractSectionBuilder";
import SectionBuilder from "../interfaces/sectionBuilder";
import {Form, Section} from "../../../form-definition";

export {
    SectionBuilder, AbstractSectionBuilder, VerticalSectionBuilder
};

export const sectionBuilders: SectionBuilder[] = [new VerticalSectionBuilder()]

export const findSectionBuilder = (form: Form, section: Section): SectionBuilder | undefined => sectionBuilders[0];
