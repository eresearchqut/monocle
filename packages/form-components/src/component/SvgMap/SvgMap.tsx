import React, { FocusEvent, FunctionComponent, MouseEvent } from 'react';
import { getMap, SvgNode } from './maps';
import './svg-map.scss';
import { v4 as uuidv4 } from 'uuid';
import { startCase } from 'lodash';

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
    label?: string;
    role?: string;
    locationRole?: string;
    isSelected?: (node: SvgNode) => boolean | undefined;
    locationTabIndex?: (node: SvgNode, index: number) => number | number;
    locationAriaLabel?: (node: SvgNode, index: number) => string | string;
}

export interface SvgMapProps extends HandlerPropsOfSvgMap, StatePropsOfSvgMapProps {}

export interface SvgNodeProps extends SvgMapProps {
    node: SvgNode;
}

export interface SvgElementNodeProps extends SvgNodeProps {
    index: number;
    key: string;
    ariaChecked: boolean | undefined;
    onClick?: (event: MouseEvent<SVGElement>) => void;
    onMouseOver?: (event: MouseEvent<SVGElement>) => void;
    onMouseOut?: (event: MouseEvent<SVGElement>) => void;
    onMouseMove?: (event: MouseEvent<SVGElement>) => void;
    onFocus?: (event: FocusEvent<SVGElement>) => void;
    onBlur?: (event: FocusEvent<SVGElement>) => void;
}

export interface SvgMapSelection {
    value: string;
    label: string;
}

export const getSelection = (element: SVGElement): SvgMapSelection | undefined => {
    if (element.nodeName === 'svg') {
        return undefined;
    }
    const value = element.getAttribute('aria-label');
    if (!value) {
        return getSelection(element.parentNode as SVGElement);
    }
    let label = element.getAttribute('aria-details');
    if (!label) {
        label = startCase(value);
    }
    return { value, label };
};

const Svg: FunctionComponent<SvgNodeProps> = (props: SvgNodeProps) => {
    const { node } = props;
    const { attributes } = node;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" {...attributes}>
            {node.children.map((childNode, childIndex) => renderChildNode(props, childNode, childIndex))}
        </svg>
    );
};

const Polygon: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const { node, ariaChecked, onMouseOver, onMouseOut, onMouseMove, onClick, onFocus, onBlur } = props;
    const { attributes } = node;
    return (
        <polygon
            {...attributes}
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

const Polyline: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const { node, ariaChecked, onMouseOver, onMouseOut, onMouseMove, onClick, onFocus, onBlur } = props;
    const { attributes } = node;
    return (
        <polyline
            {...attributes}
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

const Circle: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const { node, ariaChecked, onMouseOver, onMouseOut, onMouseMove, onClick, onFocus, onBlur } = props;
    const { attributes } = node;
    return (
        <circle
            {...attributes}
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

const Defs: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const { node } = props;
    return <defs>{node.children.map((childNode, childIndex) => renderChildNode(props, childNode, childIndex))}</defs>;
};

const Style: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const { node } = props;
    const styles = node.children.map((childNode, index) => childNode.value).join('');
    return <style>{styles}</style>;
};

const Rect: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const { node, ariaChecked, onMouseOver, onMouseOut, onMouseMove, onClick, onFocus, onBlur } = props;
    const { attributes } = node;
    return (
        <rect
            {...attributes}
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
    const { node, ariaChecked } = props;
    const { attributes } = node;

    return (
        <g {...attributes} aria-checked={ariaChecked}>
            {node.children.map((childNode, childIndex) => renderChildNode(props, childNode, childIndex))}
        </g>
    );
};

const Path: FunctionComponent<SvgElementNodeProps> = (props: SvgElementNodeProps) => {
    const { node, ariaChecked, onMouseOver, onMouseOut, onMouseMove, onClick, onFocus, onBlur } = props;
    const { attributes } = node;
    return (
        <path
            {...attributes}
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
    const { name, type } = node;
    const key = uuidv4();

    if (type === 'element') {
        const onMouseOver = props.onLocationMouseOver;
        const onMouseOut = props.onLocationMouseOut;
        const onMouseMove = props.onLocationMouseMove;
        const onClick = props.onLocationClick;
        const onFocus = props.onLocationFocus;
        const onBlur = props.onLocationBlur;

        const ariaChecked = props.isSelected && props.isSelected(node);
        const childProps = {
            ...props,
            node,
            index,
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
            case 'polyline':
                return <Polyline {...childProps} key={key} />;
            case 'circle':
                return <Circle {...childProps} key={key} />;
            default:
                return <text>Unmapped: {name}</text>;
        }
    }

    return null;
};

export const SvgMap: FunctionComponent<SvgMapProps> = (props) => {
    if (!props?.map) {
        return null;
    }

    const node = getMap(props.map);

    if (!node) {
        return null;
    }

    const svgProps = { ...props, node };

    return (
        <div className={'svg-map'}>
            <Svg {...svgProps} />
        </div>
    );
};

export default SvgMap;
