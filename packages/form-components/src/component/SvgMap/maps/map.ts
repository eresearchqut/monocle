const maps = require('./svgs.json');

export type NodeName = 'svg' | 'path' | 'g' | 'rect' | 'defs' | 'style' | 'polygon';
export type NodeType = 'element' | 'text';
export type AttributeName =
    | 'id'
    | 'viewBox'
    | 'd'
    | 'stroke-width'
    | 'fill'
    | 'transform'
    | 'class'
    | 'x'
    | 'y'
    | 'width'
    | 'height'
    | 'points';
export interface SvgNode {
    name: NodeName;
    type: NodeType;
    attributes: Record<AttributeName, string>;
    children: SvgNode[];
    value: 'text';
}

export const getMap = (id: string): SvgNode | undefined => (maps as SvgNode[]).find((map) => map.attributes.id === id);

export default maps as SvgNode[];
