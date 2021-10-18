import React, {FunctionComponent} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    IconDefinition,
    faCalendar,
    faQuestion,
    faClock,
    faCalendarAlt,
    faTextWidth, faTextHeight, faMoneyBill, faSortNumericUp, faSlidersH, faCheckSquare, faVectorSquare, faLayerGroup
} from '@fortawesome/free-solid-svg-icons';
import {faMarkdown} from "@fortawesome/free-brands-svg-icons";
import {Avatar} from 'primereact/avatar';
import {InputType, SectionType} from "@trrf/form-definition";
import startCase from "lodash/startCase";


const iconMap: Map<InputType | SectionType, IconDefinition> = new Map<InputType | SectionType, IconDefinition>([
    [SectionType.DEFAULT, faLayerGroup],
    [InputType.BOOLEAN, faCheckSquare],
    [InputType.CURRENCY, faMoneyBill],
    [InputType.DATE, faCalendar],
    [InputType.DATE_TIME, faCalendarAlt],
    [InputType.MARKDOWN, faMarkdown],
    [InputType.MULTILINE_TEXT, faTextHeight],
    [InputType.NUMERIC, faSortNumericUp],
    [InputType.RANGE, faSlidersH],
    [InputType.SVG_MAP, faVectorSquare],
    [InputType.TEXT, faTextWidth],
    [InputType.TIME, faClock]
]);

export interface ComponentIconProps {
    componentType: InputType | SectionType
}

export const ComponentIcon: FunctionComponent<ComponentIconProps> = ({componentType}) => {

    const title = startCase(componentType || '');

    return (
        <Avatar className={'p-mr-2'} >
            <FontAwesomeIcon icon={iconMap.get(componentType) || faQuestion} title={title} aria-label={title}/>
        </Avatar>
    );
};


export default ComponentIcon;