import {VerticalSectionBuilder} from "./verticalSectionBuilder";
import SectionBuilder from "../interfaces/sectionBuilder";
import {Form, Section} from "../../../form-definition";

export {
    SectionBuilder
};

export const sectionBuilders: SectionBuilder[] = [new VerticalSectionBuilder()]

export const findSectionBuilder = (form: Form, section: Section): SectionBuilder | undefined => sectionBuilders[0];
