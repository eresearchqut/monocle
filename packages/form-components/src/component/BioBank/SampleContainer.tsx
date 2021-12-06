import { first, fromPairs, min, max, range } from 'lodash';
import React, { FunctionComponent } from 'react';
import { Tooltip } from 'primereact/tooltip';
import './biobank.scss';

export interface ContainerDimensions {
    width: number;
    length: number;
}

export interface Sample {
    x: number;
    y: number;
    id: string;
    highlighted?: boolean;
}

export interface SampleContainerProps {
    dimensions: ContainerDimensions;
    samples: Sample[];
}

export const SampleContainer: FunctionComponent<SampleContainerProps> = (props) => {
    /*
    if (!props.map) {
        return null;
        */

    const rows = range(props.dimensions.length);
    const cols = range(props.dimensions.width);
    const rowHeight = 100 / rows.length;
    const colWidth = 100 / cols.length;
    // TODO container rectangulare - not square
    //const cellSide = `${max([rowHeight, colWidth])}%`;

    const toLetter = (idx: number): string => String.fromCharCode(65 + (idx % 26));
    const yLabels = (idx: number): string => (idx < 26 ? toLetter(idx) : yLabels(idx / 26 - 1) + toLetter(idx));

    const samplesByCoords = fromPairs(props.samples.map((sample) => [`${sample.x}-${sample.y}`, sample]));
    const highlightedSample = first(props.samples.filter((sample) => sample.highlighted));

    return (
        <div className="container-grid highlight">
            <div className="container-grid-inside">
                <Tooltip target=".container-grid-cell.full" mouseTrack={true} position="top" />
                {rows.map((rowIdx) => {
                    const highlightRow = highlightedSample && highlightedSample.y === rowIdx;
                    const extraRowClasses = highlightRow ? 'highlight' : '';
                    return (
                        <div
                            key={rowIdx}
                            className={`container-grid-row ${extraRowClasses}`}
                            style={{ height: `${rowHeight}%` }}
                        >
                            {cols.map((colIdx) => {
                                const sample = samplesByCoords[`${colIdx}-${rowIdx}`];
                                let extraCellClasses = sample ? 'full' : 'empty';
                                if (
                                    highlightedSample &&
                                    (highlightedSample.x === colIdx || highlightedSample.y === rowIdx)
                                ) {
                                    extraCellClasses += ' highlight';
                                }
                                return (
                                    <a
                                        href=""
                                        className={`container-grid-cell ${extraCellClasses}`}
                                        style={{ width: `${colWidth}%` }}
                                        data-pr-tooltip={sample ? sample.id : ''}
                                    >
                                        {rowIdx === 0 ? (
                                            <span className="cell-coord cell-coord-x">{colIdx + 1}</span>
                                        ) : (
                                            ''
                                        )}
                                        {colIdx === 0 ? (
                                            <span className="cell-coord cell-coord-y">{yLabels(rowIdx)}</span>
                                        ) : (
                                            ''
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SampleContainer;
