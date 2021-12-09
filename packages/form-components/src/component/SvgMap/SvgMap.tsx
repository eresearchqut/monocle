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
    const inlineStyled = node.children.some(
        (childNode) =>
            childNode.name === 'defs' && childNode.children.filter((defNodeChild) => defNodeChild.name === 'style')
    );
    const className = inlineStyled ? 'svg-map-inline-styles' : `svg-map svg-map-${props.colorScheme || 'blue'}`;
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox={viewBox}
            className={className}
            role={props.role}
            aria-label={props.label}
        >
            {node.children.map((childNode, index) => renderChildNode(props, childNode, index))}
        </svg>
    );
};

const Polygon: FunctionComponent<SvgChildNodeProps> = (props: SvgChildNodeProps) => {
    const { node } = props;
    const { attributes } = node;
    const { points, class: elementClass, id } = attributes;
    const className = `svg-polygon svg-${props.colorScheme || 'blue'} ${elementClass}`;
    return <polygon id={id} points={points} className={className} />;
};

const Defs: FunctionComponent<SvgChildNodeProps> = (props: SvgChildNodeProps) => {
    const { node } = props;
    return <defs>{node.children.map((childNode, index) => renderChildNode(props, childNode, index))}</defs>;
};

const Style: FunctionComponent<SvgChildNodeProps> = (props: SvgChildNodeProps) => {
    const { node } = props;
    const styles = node.children.map((childNode, index) => childNode.value).join('');

    return <style>{styles}</style>;
};

const Rect: FunctionComponent<SvgChildNodeProps> = (props: SvgChildNodeProps) => {
    const { node } = props;
    const { attributes } = node;
    const { id, 'stroke-width': strokeWidth, x, y, width, height, class: elementClass } = attributes;
    const className = `svg-rectangle svg-${props.colorScheme || 'blue'} ${elementClass}`;
    return <rect id={id} x={x} y={y} width={width} height={height} className={className} />;
};

const Group: FunctionComponent<SvgChildNodeProps> = (props: SvgChildNodeProps) => {
    const { node } = props;
    const { attributes } = node;
    const { id, 'stroke-width': strokeWidth, class: elementClass } = attributes;
    const className = `svg-group svg-${props.colorScheme || 'blue'} ${elementClass}`;
    return (
        <g id={id} className={className} strokeWidth={strokeWidth}>
            {node.children.map((childNode, index) => renderChildNode(props, childNode, index))}
        </g>
    );
};

const Path: FunctionComponent<SvgChildNodeProps> = (props: SvgChildNodeProps) => {
    const { node, index } = props;
    const { attributes } = node;
    const { id, d, 'stroke-width': strokeWidth, transform, class: elementClass } = attributes;
    const className = `svg-path svg-${props.colorScheme || 'blue'} ${elementClass}`;
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
    const { name, type } = node;
    const key = uuidv4();
    const childProps = { ...props, node, index };

    if (type === 'element') {
        switch (name) {
            case 'defs':
                return <Defs {...childProps} key={key} />;
            case 'style':
                return <Style {...childProps} key={key} />;
            case 'g':
                return <Group {...childProps} key={key} />;
            case 'path':
                return <Path {...childProps} key={key} />;
            case 'rect':
                return <Rect {...childProps} key={key} />;
            case 'polygon':
                return <Polygon {...childProps} key={key} />;
            default:
                return <text>Unmapped: {name}</text>;
        }
    }

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
