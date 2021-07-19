import {DefaultSectionBuilder} from "./defaultSectionBuilder";
import SectionBuilder from "../interfaces/sectionBuilder";

export {
    SectionBuilder
};

export const sectionBuilders: SectionBuilder[] = [new DefaultSectionBuilder()]


