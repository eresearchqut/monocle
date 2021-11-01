import React, {FunctionComponent} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    IconDefinition,
    faCalendar,
    faQuestion,
    faClock,
    faCalendarAlt,
    faTextWidth,
    faTextHeight,
    faMoneyBill,
    faSortNumericUp,
    faSlidersH,
    faCheckSquare,
    faVectorSquare,
    faLayerGroup,
    faClipboardCheck, faSignature
} from '@fortawesome/free-solid-svg-icons';
import {faMarkdown} from "@fortawesome/free-brands-svg-icons";
import {InputType, SectionType} from "@trrf/form-definition";
import startCase from "lodash/startCase";
import uniqueId from 'lodash/uniqueId';
import './component.scss';
import {DraggableProvided} from "react-beautiful-dnd";


const iconMap: Map<InputType | SectionType, IconDefinition> = new Map<InputType | SectionType, IconDefinition>([
    [SectionType.DEFAULT, faLayerGroup],
    [InputType.BOOLEAN, faCheckSquare],
    [InputType.CURRENCY, faMoneyBill],
    [InputType.DATE, faCalendar],
    [InputType.DATE_TIME, faCalendarAlt],
    [InputType.MARKDOWN, faMarkdown],
    [InputType.MULTILINE_TEXT, faTextHeight],
    [InputType.NUMERIC, faSortNumericUp],
    [InputType.OPTIONS, faClipboardCheck],
    [InputType.RANGE, faSlidersH],
    [InputType.SIGNATURE, faSignature],
    [InputType.SVG_MAP, faVectorSquare],
    [InputType.TEXT, faTextWidth],
    [InputType.TIME, faClock]
]);

export interface ComponentProps {
    componentType: InputType | SectionType
    draggableProvided?: DraggableProvided
}

export const Component: FunctionComponent<ComponentProps> = ({componentType, draggableProvided}) => {

    const title = startCase(componentType || '');
    const id = uniqueId(componentType);
    const style = Object.assign({width: '4em', height: '4em'}, draggableProvided?.draggableProps.style);
    const baseClasses = 'p-d-inline-flex p-flex-column p-jc-center p-button p-button-outlined p-m-1 '
    const className = draggableProvided ? `${baseClasses}  component-draggable` : baseClasses

    return (
        <div
            ref={draggableProvided?.innerRef}
            {...draggableProvided?.draggableProps}
            {...draggableProvided?.dragHandleProps}
            style={style}
            className={className}
            title={title}
            aria-label={title}>
            <FontAwesomeIcon icon={iconMap.get(componentType) || faQuestion}  aria-labelledby={id}
                              fixedWidth />
            {/*<label id={id} style={{width: '4em', fontSize: '0.8em'}} className='p-text-center p-text-light p-text-truncate p-mt-2 p-ml-2 p-mr-2'>{title}</label>*/}
        </div>
    );
};


export default Component;