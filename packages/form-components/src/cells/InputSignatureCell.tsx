import React, {useRef, useState, useEffect} from 'react';
import {
    CellProps,
    optionIs,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {withJsonFormsCellProps} from '@jsonforms/react';
import merge from "lodash/merge";
import SignaturePad from 'react-signature-canvas';
import {Image} from 'primereact/image';
import {SignaturePadOptions} from "signature_pad";
import {MenuItem} from "primereact/menuitem";
import {Menubar} from 'primereact/menubar';

export interface InputSignatureCellOptions extends HTMLCanvasElement, SignaturePadOptions {
    mimeType?: 'image/png' | 'image/jpg' | 'image/svg+xml'; // default  'image/png',
    clearOnResize?: boolean
}

export const InputSignatureCell = (props: CellProps) => {

    const {
        config,
        data,
        uischema,
        path,
        handleChange,
        visible = true,
        isValid = true
    } = props;

    const [editModeEnabled, setEditModeEnabled] = useState<boolean>(false);

    const signaturePad = useRef<SignaturePad>(null);

    useEffect(() => {
        signaturePad.current?.fromDataURL(data);
    }, [signaturePad, editModeEnabled]);

    if (!visible) {
        return null;
    }

    const inputSignatureCellOptions = merge({}, config, uischema.options) as InputSignatureCellOptions;
    const {mimeType} = inputSignatureCellOptions
    const className = isValid ? undefined : 'p-invalid';

    const save = () => {
        handleChange(path, signaturePad.current?.toDataURL(mimeType))
        setEditModeEnabled(false);
    }

    const actionsMenu: MenuItem[] = [

        {
            label: 'Save',
            icon: 'pi pi-save',
            command: save
        },
        {
            label: 'Reset',
            icon: 'pi pi-refresh',
            command: () => {
                signaturePad.current?.clear()
                signaturePad.current?.fromDataURL(data)
            }

        },
        {
            label: 'Clear',
            icon: 'pi pi-times',
            command: () => signaturePad.current?.clear()
        }
    ];

    const editMenu: MenuItem[] = [
        {
            label: 'Sign',
            icon: 'pi pi-pencil',
            command: () => setEditModeEnabled(true)
        }
    ];


    const style = {
        color: '#000000',
        border: '1px solid #000000',
        ':hover': {
            color: '#ffffff'
        }
    };


    return (
        <React.Fragment>
            <Menubar model={actionsMenu}/>
            <div style={style}>
                <SignaturePad ref={signaturePad}
                              canvasProps={{className: 'signature-canvas'}}
                              clearOnResize={false}
                />
            </div>

        </React.Fragment>
    )
}


/**
 * Default tester for date controls.
 * @type {RankedTester}
 */
export const inputSignatureCellTester: RankedTester = rankWith(2, optionIs('type', 'signature'));

export default withJsonFormsCellProps(InputSignatureCell);
