import React, {
    FunctionComponent,
    MouseEvent,
    SyntheticEvent,
    useEffect,
    useState
} from 'react';
import SvgMap, {Location, Map} from "./SvgMap";


export interface MultiSelectSvgMapProps {
    map: Map
    value: string[]
    handleChange: (selectedLocationIds: string[]) => void
}


export const MultiSelectSvgMap: FunctionComponent<MultiSelectSvgMapProps> = ({map, value, handleChange}) => {

    const [selected, setSelected] = useState<string[]>(value);

    useEffect(() => {
        console.log('internal', selected)
     handleChange(selected);
    }, [selected]);

    useEffect(() => {
        console.log('external', value)
        setSelected(() => value);
    }, [value]);

    const isSelected = (location: Location) => selected && selected.some((id) => location.id === id);

    const toggleLocation = (event: SyntheticEvent<SVGPathElement>)=> {
        const {id} = event.target;
        setSelected((current) => {
            const updated = current ? [...current] : [];
            if (updated.indexOf(id) >=  0) {
                updated.splice(updated.indexOf(id), 1);
            } else {
                updated.push(id);
            }
            return updated;
        })
    }

    const handleLocationClick = (event: MouseEvent<SVGPathElement>) => {
        event.preventDefault();
        toggleLocation(event);
    }

    return (
        <SvgMap map={map} isSelected={isSelected} onLocationClick={handleLocationClick} />
    );
}

export default SvgMap;