import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import SvgMap from './SvgMap';

export interface MultiSelectSvgMapProps {
    map: string;
    value: string[];
    handleChange: (selectedLocationIds: string[]) => void;
}

export const MultiSelectSvgMap: FunctionComponent<MultiSelectSvgMapProps> = ({ map, value, handleChange }) => {
    const [selected, setSelected] = useState<string[]>(value);

    useEffect(() => {
        handleChange(selected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    useEffect(() => {
        setSelected(() => value);
    }, [value]);

    const isSelected = (id: string) => selected && selected.some((selectedId) => selectedId === id);

    const handleLocationClick = (event: MouseEvent<SVGPathElement>) => {
        event.preventDefault();
        const { id } = event.target as SVGPathElement;
        setSelected((current) => {
            const updated = current ? [...current] : [];
            if (updated.indexOf(id) >= 0) {
                updated.splice(updated.indexOf(id), 1);
            } else {
                updated.push(id);
            }
            return updated;
        });
    };

    return <SvgMap map={map} isSelected={isSelected} onLocationClick={handleLocationClick} />;
};

export default MultiSelectSvgMap;
