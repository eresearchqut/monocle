import { startCase } from 'lodash';
import React, { FocusEvent, FunctionComponent, MouseEvent } from 'react';
import './svg-map.scss';

export interface Location {
    id: string;
    path: string;
    name?: string;
    isSelectable?: boolean;
}

export interface Map {
    viewBox: string;
    label?: string;
    locations: Location[];
}

export interface HandlerPropsOfSvgMap {
    onLocationClick?: (event: MouseEvent<SVGPathElement>) => void;
    onLocationMouseOver?: (event: MouseEvent<SVGPathElement>) => void;
    onLocationMouseOut?: (event: MouseEvent<SVGPathElement>) => void;
    onLocationMouseMove?: (event: MouseEvent<SVGPathElement>) => void;
    onLocationFocus?: (event: FocusEvent<SVGPathElement>) => void;
    onLocationBlur?: (event: FocusEvent<SVGPathElement>) => void;
}

export interface StatePropsOfSvgMapProps {
    map: Map;
    label?: string;
    role?: string;
    className?: string;
    locationRole?: string;
    isSelected?: (location: Location) => boolean;
    locationClassName?: (location: Location, index: number) => string | string;
    locationTabIndex?: (location: Location, index: number) => number | number;
    locationAriaLabel?: (location: Location, index: number) => string | string;
}

export interface SvgMapProps extends HandlerPropsOfSvgMap, StatePropsOfSvgMapProps {}

export const SvgMap: FunctionComponent<SvgMapProps> = (props) => {
    if (!props.map) {
        return null;
    }

    const viewPort = (index: number): string => props.map.viewBox.split(' ')[index];

    return (
        <div className={'svg-map-container'}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={props.map.viewBox}
                width={viewPort(2)}
                height={viewPort(3)}
                preserveAspectRatio="xMidYMid"
                className={props.className || 'svg-map'}
                role={props.role || 'none'}
                aria-label={props.map.label}
            >
                {props.map.locations.map((location, index) => {
                    const selectablePathAttrs = {
                        tabIndex:
                            typeof props.locationTabIndex === 'function'
                                ? props.locationTabIndex(location, index)
                                : props.locationTabIndex || 0,
                        'aria-checked': props.isSelected && props.isSelected(location),
                        onMouseOver: props.onLocationMouseOver,
                        onMouseOut: props.onLocationMouseOut,
                        onMouseMove: props.onLocationMouseMove,
                        onClick: props.onLocationClick,
                        onFocus: props.onLocationFocus,
                        onBlur: props.onLocationBlur,
                    };
                    const isSelectable = location.isSelectable ?? true;
                    const extraAtts = isSelectable ? selectablePathAttrs : {};

                    return (
                        <path
                            id={location.id}
                            key={location.id}
                            name={location.name}
                            d={location.path}
                            className={
                                typeof props.locationClassName === 'function'
                                    ? props.locationClassName(location, index)
                                    : props.locationClassName || 'svg-map__location'
                            }
                            role={props.locationRole || 'none'}
                            aria-label={
                                typeof props.locationAriaLabel === 'function'
                                    ? props.locationAriaLabel(location, index)
                                    : location.name
                            }
                            {...extraAtts}
                        >
                            <title>{location.name || startCase(location.id)}</title>
                        </path>
                    );
                })}
            </svg>
        </div>
    );
};

export default SvgMap;
