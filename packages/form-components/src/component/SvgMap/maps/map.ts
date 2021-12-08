const maps = require('./svgs.json');

export type NodeType = 'svg' | 'path' | 'g';
export type AttributeName = 'id' | 'viewBox' | 'd' | 'stroke-width' | 'fill' | 'transform';
export interface SvgNode {
    name: NodeType;
    type: string;
    attributes: Record<AttributeName, string>;
    children: SvgNode[];
}

export const getMap = (id: string): SvgNode | undefined => (maps as SvgNode[]).find((map) => map.attributes.id === id);

export default maps as SvgNode[];
