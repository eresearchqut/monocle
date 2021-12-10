import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import SvgMap from './SvgMap';
import { SvgNode } from './maps';

export interface MultiSelectSvgMapProps {
    map: string;
    value: string[];
    handleChange: (selectedLocationIds: string[]) => void;
}

export const getAriaLabel = (element: SVGElement): string | undefined => {
    if (element.nodeName === 'svg') {
        return undefined;
    }
    const ariaLabel = element.getAttribute('aria-label');
    if (!ariaLabel) {
        return getAriaLabel(element.parentNode as SVGElement);
    }
    return ariaLabel;
};

export const MultiSelectSvgMap: FunctionComponent<MultiSelectSvgMapProps> = ({ map, value, handleChange }) => {
    const [selected, setSelected] = useState<string[]>(value);

    useEffect(() => {
        handleChange(selected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    useEffect(() => {
        setSelected(() => value);
    }, [value]);

    const isSelected = (node: SvgNode) =>
        selected && node.attributes['aria-label']
            ? selected.some((value) => value === node.attributes['aria-label'])
            : undefined;

    const handleLocationClick = (event: MouseEvent<SVGElement>) => {
        event.preventDefault();
        const element = event.target as SVGElement;
        const ariaLabel = getAriaLabel(element);
        if (ariaLabel) {
            setSelected((current) => {
                const updated = current ? [...current] : [];
                if (updated.indexOf(ariaLabel) >= 0) {
                    updated.splice(updated.indexOf(ariaLabel), 1);
                } else {
                    updated.push(ariaLabel);
                }
                return updated;
            });
        }
    };

    return <SvgMap map={map} isSelected={isSelected} onLocationClick={handleLocationClick} />;
};

export default MultiSelectSvgMap;
