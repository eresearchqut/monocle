import React from 'react';
import { and, ControlProps, ControlState, optionIs, RankedTester, rankWith, uiTypeIs } from '@jsonforms/core';
import { Control, withJsonFormsControlProps } from '@jsonforms/react';

import { ReactQRScanner } from '../../component/QRCode/ReactQRScanner';

export class QRScannerControl extends Control<ControlProps, ControlState> {
    render() {
        const { data } = this.props;
        const { fps, autoStartScanning } = data;

        return (
            <div className="p-field">
                <ReactQRScanner autoStartScanning={autoStartScanning} videoMaxWidthPx={640} />
            </div>
        );
    }
}

export const isQRScannerControl = and(uiTypeIs('Control'), optionIs('type', 'qr-scanner'));

export const qrScannerControlTester: RankedTester = rankWith(2, isQRScannerControl);
export default withJsonFormsControlProps(QRScannerControl);
