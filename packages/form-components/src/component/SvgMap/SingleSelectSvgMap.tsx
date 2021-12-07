import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import SvgMap from './SvgMap';

export interface SingleSelectSvgMapProps {
    map: string;
    value: string;
    handleChange: (selectedLocationId: string | undefined) => void;
}

export const SingleSelectSvgMap: FunctionComponent<SingleSelectSvgMapProps> = ({ map, value, handleChange }) => {
    const [selected, setSelected] = useState<string | undefined>(value);

    useEffect(() => {
        handleChange(selected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    useEffect(() => {
        setSelected(() => value);
    }, [value]);

    const isSelected = (id: string, index: number) => (selected ? selected === id : false);

    const handleLocationClick = (event: MouseEvent<SVGPathElement>) => {
        event.preventDefault();
        const { id } = event.target as SVGPathElement;
        setSelected((current) => (id === current ? undefined : id));
    };

    return <SvgMap map={map} isSelected={isSelected} onLocationClick={handleLocationClick} />;
};

export default SingleSelectSvgMap;
