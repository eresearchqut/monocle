import React, {FocusEvent, FunctionComponent, MouseEvent} from 'react';

export interface Location {
    id: string
    path: string,
    name?: string
}

export interface Map {
    viewBox: string
    label?: string
    locations: Location[]
}

export interface HandlerPropsOfSvgMap {
    onLocationClick?: (event: MouseEvent<SVGPathElement>) => void,
    onLocationMouseOver?: (event: MouseEvent<SVGPathElement>) => void,
    onLocationMouseOut?: (event: MouseEvent<SVGPathElement>) => void,
    onLocationMouseMove?: (event: MouseEvent<SVGPathElement>) => void,
    onLocationFocus?: (event: FocusEvent<SVGPathElement>) => void,
    onLocationBlur?:  (event: FocusEvent<SVGPathElement>) => void
}

export interface StatePropsOfSvgMapProps {
    map: Map,
    label?: string,
    role?: string,
    className?: string,
    locationRole?: string,
    isSelected?: (location: Location) => boolean,
    locationClassName?: (location: Location, index: number) => string | string,
    locationTabIndex?: (location: Location, index: number) => string | string,
    locationAriaLabel?: (location: Location, index: number) => string | string,
}

export interface SvgMapProps extends HandlerPropsOfSvgMap, StatePropsOfSvgMapProps {

}

export const SvgMap: FunctionComponent<SvgMapProps> = (props) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={props.map.viewBox}
            className={props.className || 'svg-map'}
            role={props.role || 'none'}
            aria-label={props.map.label}
        >
            {props.map.locations.map((location, index) => {
                return (
                    <path
                        id={location.id}
                        key={location.id}
                        name={location.name}
                        d={location.path}
                        className={typeof props.locationClassName === 'function' ? props.locationClassName(location, index) : props.locationClassName || 'svg-map__location'}
                        tabIndex={typeof props.locationTabIndex === 'function' ? props.locationTabIndex(location, index) : props.locationTabIndex || '0'}
                        role={props.locationRole || 'none'}
                        aria-label={typeof props.locationAriaLabel === 'function' ? props.locationAriaLabel(location, index) : location.name}
                        aria-checked={props.isSelected && props.isSelected(location)}
                        onMouseOver={props.onLocationMouseOver}
                        onMouseOut={props.onLocationMouseOut}
                        onMouseMove={props.onLocationMouseMove}
                        onClick={props.onLocationClick}
                        onFocus={props.onLocationFocus}
                        onBlur={props.onLocationBlur}
                    />
                );
            })}
        </svg>
    );
}

export default SvgMap;