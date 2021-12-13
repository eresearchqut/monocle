import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import SvgMap, { getSelection, SvgMapSelection } from './SvgMap';
import { SvgNode } from './maps';

export interface SingleSelectSvgMapProps {
    map: string;
    value: SvgMapSelection;
    handleChange: (selectedLocationId: SvgMapSelection | undefined) => void;
}

export const SingleSelectSvgMap: FunctionComponent<SingleSelectSvgMapProps> = ({ map, value, handleChange }) => {
    const [selected, setSelected] = useState<SvgMapSelection | undefined>(value);

    useEffect(() => {
        handleChange(selected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    useEffect(() => {
        setSelected(() => value);
    }, [value]);

    const isSelected = (node: SvgNode) =>
        selected && node.attributes['aria-label'] ? selected.value === node.attributes['aria-label'] : undefined;

    const handleLocationClick = (event: MouseEvent<SVGElement>) => {
        event.preventDefault();
        const element = event.target as SVGElement;
        const selection = getSelection(element);
        if (selection) {
            setSelected((current) => (selection === current ? undefined : selection));
        }
    };

    return <SvgMap map={map} isSelected={isSelected} onLocationClick={handleLocationClick} />;
};

export default SingleSelectSvgMap;
