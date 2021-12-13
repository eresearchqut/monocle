import { first, fromPairs, min, max, range } from 'lodash';
import React, { FunctionComponent } from 'react';
import { Tooltip } from 'primereact/tooltip';
import './biobank.scss';

export interface ContainerDimensions {
    width: number;
    length: number;
}

export interface Sample {
    id: string;
    row: number;
    col: number;
    highlighted?: boolean;
}

export interface SampleContainerProps {
    dimensions: ContainerDimensions;
    maxWidth?: string;
    samples: Sample[];
    onSampleClick?: (sample: Sample) => void;
}

export const SampleContainer: FunctionComponent<SampleContainerProps> = (props) => {
    const rows = range(props.dimensions.length);
    const cols = range(props.dimensions.width);
    const colWidth = 100 / cols.length;

    let style: React.CSSProperties = {};
    if (props.maxWidth) {
        style.maxWidth = props.maxWidth;
    }

    // row labelling scheme: A, B, ... , Z, AA, AB, ..., AZ, AAA, AAB, etc.
    const toLetter = (idx: number): string => String.fromCharCode(65 + (idx % 26));
    const rowLabels = (idx: number): string => (idx < 26 ? toLetter(idx) : rowLabels(idx / 26 - 1) + toLetter(idx));

    const samplesByCoords = fromPairs(props.samples.map((sample) => [`${sample.col}-${sample.row}`, sample]));
    const highlightedSample = first(props.samples.filter((sample) => sample.highlighted));

    return (
        <div className="container-grid p-d-flex p-jc-center">
            <div className="container-grid-inside" style={style}>
                <Tooltip target=".container-grid-cell.full" mouseTrack={true} position="top" />
                {rows.map((rowIdx) => {
                    const highlightRow = highlightedSample && highlightedSample.row === rowIdx;
                    const extraRowClasses = highlightRow ? 'highlight' : '';
                    return (
                        <div key={rowIdx} className={`container-grid-row ${extraRowClasses}`}>
                            {cols.map((colIdx) => {
                                const sample = samplesByCoords[`${colIdx}-${rowIdx}`];
                                const isHighlighted =
                                    highlightRow || (highlightedSample && highlightedSample.col === colIdx);
                                return (
                                    <Cell
                                        key={colIdx}
                                        rowIdx={rowIdx}
                                        colIdx={colIdx}
                                        widthPercentage={colWidth}
                                        colLabelNames={rowLabels}
                                        sample={sample}
                                        highlight={isHighlighted}
                                        onSampleClick={props.onSampleClick}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

interface CellProps {
    rowIdx: number;
    colIdx: number;
    widthPercentage: number;
    colLabelNames?: (idx: number) => string;
    rowLabelNames?: (idx: number) => string;
    sample?: Sample;
    highlight?: boolean;
    onSampleClick?: (sample: Sample) => void;
}

const Cell: FunctionComponent<CellProps> = (props) => {
    const extraCellContentClasses = props.sample && props.sample.highlighted ? 'highlight' : '';
    let extraCellClasses = props.sample ? 'full' : 'empty';
    if (props.highlight) {
        extraCellClasses += ' highlight';
    }
    const numberIdx = (idx: number): string => (idx + 1).toString();
    const colLabelNames = props.colLabelNames || numberIdx;
    const rowLabelNames = props.rowLabelNames || numberIdx;

    const RowLabel: FunctionComponent = () => (
        <span className="cell-coord cell-coord-y p-text-secondary">{colLabelNames(props.rowIdx)}</span>
    );
    const ColumnLabel: FunctionComponent = () => (
        <span className="cell-coord cell-coord-x p-text-secondary">{rowLabelNames(props.colIdx)}</span>
    );

    const isFirstRow = props.rowIdx === 0;
    const isFirstColumn = props.colIdx === 0;

    const handleClick = () => {
        if (props.sample && props.onSampleClick) {
            props.onSampleClick(props.sample);
        }
    };

    return (
        <div
            className={`container-grid-cell ${extraCellClasses}`}
            style={{ width: `${props.widthPercentage}%` }}
            data-pr-tooltip={props.sample ? props.sample.id : ''}
        >
            {isFirstColumn && <RowLabel />}
            {isFirstRow && <ColumnLabel />}
            <div className={`cell-content ${extraCellContentClasses}`} onClick={handleClick}>
                {props.sample && <SolidCircle />}
            </div>
        </div>
    );
};

const SolidCircle: FunctionComponent = (props) => {
    return (
        // Changed original SVG to auto-scale (no fixed width, height and preserveAspectRatio)
        <svg viewBox="0 0 32 32" preserveAspectRatio="xMinYMin meet">
            <path
                // Coloring through CSS so we can change Circle color based on selected Theme
                //style="fill:#555555;fill-opacity:1;stroke:none"
                d="m 31.791954,16.014721 a 15.895977,15.895977 0 1 1 -31.791954,0 15.895977,15.895977 0 1 1 31.791954,0 z"
                transform="matrix(1.006544,0,0,1.006544,0,-0.11952154)"
            />
        </svg>
    );
};

export default SampleContainer;
