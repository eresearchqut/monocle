import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import SvgMap from './SvgMap';

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

    const isSelected = (id: string, index: number) => (selected ? selected === id : false);

    const handleLocationClick = (event: MouseEvent<SVGElement>) => {
        event.preventDefault();
        const { id } = event.target as SVGElement;
        setSelected((current) => (id === current ? undefined : id));
    };

    return <SvgMap map={map} isSelected={isSelected} onLocationClick={handleLocationClick} colorScheme={colorScheme} />;
};

export default SingleSelectSvgMap;
