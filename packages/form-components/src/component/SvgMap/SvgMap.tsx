import React, { FocusEvent, FunctionComponent, MouseEvent } from 'react';
import { getMap, SvgNode } from './maps';
import './svg-map.scss';
import { v4 as uuidv4 } from 'uuid';

export interface HandlerPropsOfSvgMap {
    onLocationClick?: (event: MouseEvent<SVGElement>) => void;
    onLocationMouseOver?: (event: MouseEvent<SVGElement>) => void;
    onLocationMouseOut?: (event: MouseEvent<SVGElement>) => void;
    onLocationMouseMove?: (event: MouseEvent<SVGElement>) => void;
    onLocationFocus?: (event: FocusEvent<SVGElement>) => void;
    onLocationBlur?: (event: FocusEvent<SVGElement>) => void;
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

export interface SvgElementNodeProps extends SvgNodeProps {
    index: number;
    key: string;
    tabIndex: number | undefined;
    role: string | undefined;
    ariaLabel: string | undefined;
    ariaChecked: boolean | undefined;
    onClick?: (event: MouseEvent<SVGElement>) => void;
    onMouseOver?: (event: MouseEvent<SVGElement>) => void;
    onMouseOut?: (event: MouseEvent<SVGElement>) => void;
    onMouseMove?: (event: MouseEvent<SVGElement>) => void;
    onFocus?: (event: FocusEvent<SVGElement>) => void;
    onBlur?: (event: FocusEvent<SVGElement>) => void;
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

const Polygon: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const {
        node,
        tabIndex,
        role,
        ariaLabel,
        ariaChecked,
        onMouseOver,
        onMouseOut,
        onMouseMove,
        onClick,
        onFocus,
        onBlur,
    } = props;
    const { attributes } = node;
    const { points, class: elementClass, id } = attributes;
    const className = `svg-polygon svg-${props.colorScheme || 'blue'} ${elementClass}`;
    return (
        <polygon
            id={id}
            points={points}
            className={className}
            aria-label={ariaLabel}
            aria-checked={ariaChecked}
            tabIndex={tabIndex}
            role={role}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onMouseMove={onMouseMove}
            onClick={onClick}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};

const Defs: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const { node } = props;
    return <defs>{node.children.map((childNode, index) => renderChildNode(props, childNode, index))}</defs>;
};

const Style: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const { node } = props;
    const styles = node.children.map((childNode, index) => childNode.value).join('');

    return <style>{styles}</style>;
};

const Rect: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const {
        node,
        tabIndex,
        role,
        ariaLabel,
        ariaChecked,
        onMouseOver,
        onMouseOut,
        onMouseMove,
        onClick,
        onFocus,
        onBlur,
    } = props;
    const { attributes } = node;
    const { id, 'stroke-width': strokeWidth, x, y, width, height, class: elementClass } = attributes;
    const className = `svg-rectangle svg-${props.colorScheme || 'blue'} ${elementClass}`;

    return (
        <rect
            id={id}
            x={x}
            y={y}
            width={width}
            height={height}
            className={className}
            tabIndex={tabIndex}
            role={role}
            aria-label={ariaLabel}
            aria-checked={ariaChecked}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onMouseMove={onMouseMove}
            onClick={onClick}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};

const Group: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const {
        node,
        tabIndex,
        role,
        ariaLabel,
        ariaChecked,
        onMouseOver,
        onMouseOut,
        onMouseMove,
        onClick,
        onFocus,
        onBlur,
    } = props;
    const { attributes } = node;
    const { id, 'stroke-width': strokeWidth, class: elementClass } = attributes;
    const className = `svg-group svg-${props.colorScheme || 'blue'} ${elementClass}`;
    return (
        <g
            id={id}
            className={className}
            strokeWidth={strokeWidth}
            tabIndex={tabIndex}
            role={role}
            aria-label={ariaLabel}
            aria-checked={ariaChecked}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onMouseMove={onMouseMove}
            onClick={onClick}
            onFocus={onFocus}
            onBlur={onBlur}
        >
            {node.children.map((childNode, index) => renderChildNode(props, childNode, index))}
        </g>
    );
};

const Path: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const {
        node,
        tabIndex,
        role,
        ariaLabel,
        ariaChecked,
        onMouseOver,
        onMouseOut,
        onMouseMove,
        onClick,
        onFocus,
        onBlur,
    } = props;
    const { attributes } = node;
    const { id, d, 'stroke-width': strokeWidth, transform, class: elementClass } = attributes;
    const className = `svg-path svg-${props.colorScheme || 'blue'} ${elementClass}`;

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
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            onMouseMove={onMouseMove}
            onClick={onClick}
            onFocus={onFocus}
            onBlur={onBlur}
        />
    );
};

export const renderChildNode = (props: SvgMapProps, node: SvgNode, index: number) => {
    const { name, type, attributes } = node;
    const { id } = attributes;
    const key = uuidv4();

    if (type === 'element') {
        const onMouseOver = id ? props.onLocationMouseOver : undefined;
        const onMouseOut = id ? props.onLocationMouseOut : undefined;
        const onMouseMove = id ? props.onLocationMouseMove : undefined;
        const onClick = id ? props.onLocationClick : undefined;
        const onFocus = id ? props.onLocationFocus : undefined;
        const onBlur = id ? props.onLocationBlur : undefined;
        const tabIndex =
            typeof props.locationTabIndex === 'function'
                ? props.locationTabIndex(id, index)
                : props.locationTabIndex || 0;
        const role = props.locationRole || 'none';
        const ariaLabel =
            typeof props.locationAriaLabel === 'function' ? props.locationAriaLabel(id, index) : node.attributes.id;
        const ariaChecked = props.isSelected && props.isSelected(id, index);
        const childProps = {
            ...props,
            node,
            index,
            tabIndex,
            role,
            ariaLabel,
            ariaChecked,
            onMouseOver,
            onMouseOut,
            onMouseMove,
            onClick,
            onFocus,
            onBlur,
        };

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
