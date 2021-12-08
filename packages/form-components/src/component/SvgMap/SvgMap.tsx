import React, { FocusEvent, FunctionComponent, MouseEvent } from 'react';
import { getMap, SvgNode } from './maps';
import './svg-map.scss';
import { v4 as uuidv4 } from 'uuid';

export interface HandlerPropsOfSvgMap {
    onLocationClick?: (event: MouseEvent<SVGPathElement>) => void;
    onLocationMouseOver?: (event: MouseEvent<SVGPathElement>) => void;
    onLocationMouseOut?: (event: MouseEvent<SVGPathElement>) => void;
    onLocationMouseMove?: (event: MouseEvent<SVGPathElement>) => void;
    onLocationFocus?: (event: FocusEvent<SVGPathElement>) => void;
    onLocationBlur?: (event: FocusEvent<SVGPathElement>) => void;
}

export interface StatePropsOfSvgMapProps {
    map: string;
    colorScheme?: 'blue' | 'green' | 'yellow' | 'cyan' | 'pink' | 'indigo' | 'teal' | 'orange' | 'blue-gray' | 'purple';
    label?: string;
    role?: string;
    locationRole?: string;
    isSelected?: (id: string, index: number) => boolean;
    locationTabIndex?: (id: string, index: number) => number | number;
    locationAriaLabel?: (id: string, index: number) => string | string;
}

export interface SvgMapProps extends HandlerPropsOfSvgMap, StatePropsOfSvgMapProps {}

export interface SvgNodeProps extends SvgMapProps {
    node: SvgNode;
}

export interface SvgChildNodeProps extends SvgNodeProps {
    index: number;
    key: string;
}

const Svg: FunctionComponent<SvgNodeProps> = (props: SvgNodeProps) => {
    const { node } = props;
    const { attributes } = node;
    const { viewBox } = attributes;
    const className = `svg-map svg-map-${props.colorScheme || 'blue'}`;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            className={className}
            role={props.role || 'none'}
            aria-label={props.label}
        >
            {node.children.map((childNode, index) => renderChildNode(props, childNode, index))}
        </svg>
    );
};

const Group: FunctionComponent<SvgChildNodeProps> = (props: SvgChildNodeProps) => {
    const { node, key } = props;
    const { attributes } = node;
    const { id, 'stroke-width': strokeWidth } = attributes;
    const className = `svg-group svg-${props.colorScheme || 'blue'}`;
    return (
        <g id={id} key={key} className={className} strokeWidth={strokeWidth}>
            {node.children.map((childNode, index) => renderChildNode(props, childNode, index))}
        </g>
    );
};

const Path: FunctionComponent<SvgChildNodeProps> = (props: SvgChildNodeProps) => {
    const { node, index, key } = props;
    const { attributes } = node;
    const { id, d, 'stroke-width': strokeWidth, transform } = attributes;
    const className = `svg-path svg-${props.colorScheme || 'blue'}`;
    const tabIndex =
        typeof props.locationTabIndex === 'function'
            ? props.locationTabIndex(node.attributes.id, index)
            : props.locationTabIndex || 0;
    const role = props.locationRole || 'none';
    const ariaLabel =
        typeof props.locationAriaLabel === 'function'
            ? props.locationAriaLabel(node.attributes.id, index)
            : node.attributes.id;
    const ariaChecked = props.isSelected && props.isSelected(node.attributes.id, index);

    return (
        <path
            id={id}
            key={key}
            d={d}
            transform={transform}
            strokeWidth={strokeWidth}
            className={className}
            tabIndex={tabIndex}
            role={role}
            aria-label={ariaLabel}
            aria-checked={ariaChecked}
            onMouseOver={props.onLocationMouseOver}
            onMouseOut={props.onLocationMouseOut}
            onMouseMove={props.onLocationMouseMove}
            onClick={props.onLocationClick}
            onFocus={props.onLocationFocus}
            onBlur={props.onLocationBlur}
        />
    );
};

export const renderChildNode = (props: SvgMapProps, node: SvgNode, index: number) => {
    const { attributes } = node;
    const { id } = attributes;
    const key = id || uuidv4();
    const childProps = { ...props, node, index, key };

    if (node.name === 'path') return <Path {...childProps} />;

    if (node.name === 'g') return <Group {...childProps} />;

    return null;
};

export const SvgMap: FunctionComponent<SvgMapProps> = (props) => {
    if (!props.map) {
        return null;
    }

    const node = getMap(props.map);

    if (!node) {
        return null;
    }

    const svgProps = { ...props, node };

    return (
        <div className={'svg-map-container'}>
            <Svg {...svgProps} />
        </div>
    );
};

export default SvgMap;
