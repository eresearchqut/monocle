import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import SvgMap from './SvgMap';
import { SvgNode } from './maps';
import { getAriaLabel } from './MultiSelectSvgMap';

export interface SingleSelectSvgMapProps {
    map: string;
    value: string;
    handleChange: (selectedLocationId: string | undefined) => void;
    colorScheme?: 'blue' | 'green' | 'yellow' | 'cyan' | 'pink' | 'indigo' | 'teal' | 'orange' | 'blue-gray' | 'purple';
}

export const SingleSelectSvgMap: FunctionComponent<SingleSelectSvgMapProps> = ({
    map,
    value,
    handleChange,
    colorScheme,
}) => {
    const [selected, setSelected] = useState<string | undefined>(value);

    useEffect(() => {
        handleChange(selected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    useEffect(() => {
        setSelected(() => value);
    }, [value]);

    const isSelected = (node: SvgNode) =>
        selected && node.attributes['aria-label'] ? selected === node.attributes['aria-label'] : undefined;

    const handleLocationClick = (event: MouseEvent<SVGElement>) => {
        event.preventDefault();
        const element = event.target as SVGElement;
        const ariaLabel = getAriaLabel(element);
        if (ariaLabel) {
            setSelected((current) => (ariaLabel === current ? undefined : ariaLabel));
        }
    };

    return <SvgMap map={map} isSelected={isSelected} onLocationClick={handleLocationClick} colorScheme={colorScheme} />;
};

export default SingleSelectSvgMap;
