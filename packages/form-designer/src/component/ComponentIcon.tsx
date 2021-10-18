import React, {FunctionComponent} from 'react';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faCalendar, IconDefinition} from '@fortawesome/free-solid-svg-icons';

const iconMap: Map<string, IconDefinition> = new Map<string, IconDefinition>([
    ['date', faCalendar]
]);

export interface ComponentIconProps {
    inputType: string
}

export const ComponentIcon: FunctionComponent<ComponentIconProps> = ({ inputType}) => {



    return <FontAwesomeIcon icon={iconMap.get(inputType) || faCalendar}/>
};


export default ComponentIcon;