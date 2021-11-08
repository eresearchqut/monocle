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
    faClipboardCheck,
    faSignature, faMapPin, faFlag, faFlagCheckered
} from '@fortawesome/free-solid-svg-icons';
import {faMarkdown} from "@fortawesome/free-brands-svg-icons";
import {InputType, SectionType} from "@trrf/form-definition";
import {DraggableProvided} from "react-beautiful-dnd";
import './component.scss';

export interface ComponentMetadata {
    icon: IconDefinition
    label: string,
    description: string
}

const componentDefaults: Map<InputType | SectionType, ComponentMetadata> =
    new Map<InputType | SectionType, ComponentMetadata>([
        [SectionType.DEFAULT, {
            icon: faLayerGroup,
            label: 'Section',
            description: 'A section that contains one or more form elements'
        }],
        [InputType.ADDRESS, {
            icon: faMapPin,
            label: 'Address',
            description: 'Address input with lookup verification'
        }],
        [InputType.BOOLEAN, {
            icon: faCheckSquare,
            label: 'Checkbox',
            description: 'A single checkbox, suitable for yes or no answers'
        }],
        [InputType.COUNTRY, {
            icon: faFlag,
            label: 'Country',
            description: 'Country selector, stores ISO 3166 short code(s)'
        }],
        [InputType.CURRENCY, {
            icon: faMoneyBill,
            label: 'Currency',
            description: 'Monetary amount'
        }],
        [InputType.DATE, {
            icon: faCalendar,
            label: 'Date',
            description: 'A date picker, does not include time selection'
        }],
        [InputType.DATE_TIME, {
            icon: faCalendarAlt,
            label: 'Date Time',
            description: 'A date picker that includes time selection'
        }],
        [InputType.MARKDOWN, {
            icon: faMarkdown,
            label: 'Markdown',
            description: 'Rich text editor that support markdown syntax'
        }],
        [InputType.MULTILINE_TEXT, {
            icon: faTextHeight,
            label: 'Multiline Text',
            description: 'Multiline plain text input'
        }],
        [InputType.NUMERIC, {
            icon: faSortNumericUp,
            label: 'Number',
            description: 'Numeric input'
        }],
        [InputType.OPTIONS, {
            icon: faClipboardCheck,
            label: 'Options',
            description: 'Single or multiple choice from a list of options'
        }],
        [InputType.RANGE, {
            icon: faSlidersH,
            label: 'Range',
            description: 'Numeric range selection'
        }],
        [InputType.SIGNATURE, {
            icon: faSignature,
            label: 'Signature',
            description: 'Digital signature input'
        }],
        [InputType.SVG_MAP, {
            icon: faVectorSquare,
            label: 'Image map',
            description: 'Select a part of an image'
        }],
        [InputType.TEXT, {
            icon: faTextWidth,
            label: 'Text',
            description: 'Single line text input'
        }],
        [InputType.TIME, {
            icon: faClock,
            label: 'Time',
            description: 'Time picker (without date)'
        }]
    ]);


export interface ComponentProps {
    componentType: InputType | SectionType
    label?: string
    description?: string
    draggableProvided?: DraggableProvided,
    className?: string,
    children?: React.ReactNode

}

export const Component: FunctionComponent<ComponentProps> = ({
                                                                 componentType,
                                                                 label,
                                                                 className,
                                                                 description,
                                                                 draggableProvided,
                                                                 children
                                                             }) => {


    const metadata = componentDefaults.get(componentType);
    const title = label ? label : metadata?.label;
    const guidance = description ? description : metadata?.description;

    return (
        <div
            ref={draggableProvided?.innerRef}
            {...draggableProvided?.draggableProps}
            {...draggableProvided?.dragHandleProps}
            style={draggableProvided?.draggableProps.style}
            className={`${className} p-d-flex p-jc-start`}>
            <FontAwesomeIcon className='p-button p-button-outlined p-p-2'

                             title={title}
                             icon={metadata?.icon || faQuestion}
                             style={{width: '3em', height: '3em'}}
                             fixedWidth/>

            <div className='p-d-inline-flex p-flex-column p-ml-2 p-mt-2'>
                <label className={'p-text-bold'}>{title}</label>
                {guidance && <small className={'p-text-light'}>{guidance}</small>}
            </div>

            {children}

        </div>
    );
}


export default Component;