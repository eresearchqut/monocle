import React from 'react';
import { Section} from "@trrf/form-definition";
import {Card} from "primereact/card";

export interface SectionBuilderUiProps  {
    section: Section;
}

export const SectionBuilderUi = ({section, ...props}: SectionBuilderUiProps) => {
    return (<Card title={section.name}></Card>);
}
