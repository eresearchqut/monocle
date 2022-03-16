import * as React from 'react';
import { Meta, Story } from '@storybook/react';
import ReactQRScanner, { ReactQRScannerProps } from './ReactQRScanner';

export default {
    title: 'Components/QR Scanner',
    component: ReactQRScanner,
} as Meta;

const Template: Story<ReactQRScannerProps> = (props) => <ReactQRScanner {...props} />;

export const NoAutostart = Template.bind({});
NoAutostart.args = { autoStartScanning: false };

export const SmallerVideo = Template.bind({});
SmallerVideo.args = { videoMaxWidthPx: 320 };

export const Default = Template.bind({});
Default.args = {};
