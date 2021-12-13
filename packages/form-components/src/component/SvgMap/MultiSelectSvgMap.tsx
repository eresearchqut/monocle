import React, { FunctionComponent, MouseEvent, useEffect, useState } from 'react';
import SvgMap, { SvgMapSelection, getSelection } from './SvgMap';
import { SvgNode } from './maps';

export interface MultiSelectSvgMapProps {
    map: string;
    value: SvgMapSelection[];
    handleChange: (selections: SvgMapSelection[]) => void;
}

export const MultiSelectSvgMap: FunctionComponent<MultiSelectSvgMapProps> = ({ map, value, handleChange }) => {
    const [selected, setSelected] = useState<SvgMapSelection[]>(value);

    useEffect(() => {
        handleChange(selected);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    useEffect(() => {
        setSelected(() => value);
    }, [value]);

    const isSelected = (node: SvgNode) =>
        selected && node.attributes['aria-label']
            ? selected.some((svgMapSelection) => svgMapSelection.value === node.attributes['aria-label'])
            : undefined;

    const handleLocationClick = (event: MouseEvent<SVGElement>) => {
        event.preventDefault();
        const element = event.target as SVGElement;
        const selection = getSelection(element);
        if (selection) {
            setSelected((current) => {
                const updated = current ? [...current] : [];
                if (updated.find((selected) => selected.value === selection.value)) {
                    updated.splice(
                        updated.findIndex((selected) => selected.value === selection.value),
                        1
                    );
                } else {
                    updated.push(selection);
                }

                //  console.log(selection, current, updated);

                return updated;
            });
        }
    };

    return <SvgMap map={map} isSelected={isSelected} onLocationClick={handleLocationClick} />;
};

export default MultiSelectSvgMap;
