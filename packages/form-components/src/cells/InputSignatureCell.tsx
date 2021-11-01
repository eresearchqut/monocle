import React, {useRef, useState, useEffect} from 'react';
import {
    CellProps,
    optionIs,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';
import merge from "lodash/merge";
import SignaturePad from 'signature_pad';
import {Image} from 'primereact/image';

import {MenuItem} from "primereact/menuitem";
import {Menubar} from 'primereact/menubar';
import {useResizeDetector} from 'react-resize-detector';
import {trimCanvas} from "../utils/trimCanvas";

import {Button} from 'primereact/button';

import './signature.scss';

export interface InputSignatureCellOptions {
    mimeType?: 'image/png' | 'image/jpg' | 'image/svg+xml'; // default  'image/png',
}

export const InputSignatureCell = (props: CellProps) => {

    const {
        config,
        data,
        uischema,
        path,
        handleChange,
        enabled = true,
        visible = true
    } = props;


    const {width, height, ref} = useResizeDetector();
    const canvas = useRef<HTMLCanvasElement>(null);

    const [editing, setEditing] = useState<boolean>(!data);

    useEffect(() => {
        if (enabled && editing && ref.current && canvas.current && width && height) {
            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.current.width = width * ratio - 2;
            new SignaturePad(canvas.current, {
                // It's Necessary to use an opaque color when saving image as JPEG;
                // this option can be omitted if only saving as PNG or SVG
                backgroundColor: 'rgb(255, 255, 255)'
            });
        }
    }, [editing, ref, width, height, canvas]);

    if (!visible) {
        return null;
    }

    const inputSignatureCellOptions = merge({}, config, uischema.options) as InputSignatureCellOptions;
    const {mimeType} = inputSignatureCellOptions;

    const save = () => {
        if (canvas?.current) {
            trimCanvas(canvas.current);
            handleChange(path, canvas.current.toDataURL(mimeType));
        }
        setEditing(false);
    }

    if (editing) {
        return (
            <div className={'signature-container'} ref={ref}>
                <canvas ref={canvas}/>
                <Button label="Save" icon="pi pi-save" className="p-button-outlined"
                        onClick={save}/>
                <Button label="Cancel" className="p-button-outlined p-ml-1" icon="pi pi-times"
                        onClick={() => setEditing(false)}/>
            </div>
        )
    }

    return (
        <div className="p-d-flex p-flex-column" ref={ref}>
            <Image src={data} />
            {enabled &&
                <div>
                    <Button label="Sign" className="p-button-outlined p-mt-1" icon="pi pi-pencil"
                            onClick={() => setEditing(true)}/>
                </div>
            }
        </div>
    )

}


/**
 * Default tester for date controls.
 * @type {RankedTester}
 */
export const inputSignatureCellTester: RankedTester = rankWith(2, optionIs('type', 'signature'));

export default withJsonFormsCellProps(InputSignatureCell);
