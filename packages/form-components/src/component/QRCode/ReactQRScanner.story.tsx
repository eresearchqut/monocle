import * as React from 'react';
import { Meta, Story } from '@storybook/react';
import ReactQRScanner, { ReactQRScannerProps } from './ReactQRScanner';

export default {
    title: 'Components/QR Scanner',
    component: ReactQRScanner,
} as Meta;

// const Template: Story<SampleContainerProps> = (props) => <SampleContainer {...props} />;
const Template: Story<ReactQRScannerProps> = (props) => <ReactQRScanner {...props} />;

export const OneFPS = Template.bind({});
OneFPS.args = { fps: 1 };

export const FiveFPS = Template.bind({});
FiveFPS.args = { fps: 5 };

export const TenFPS = Template.bind({});
TenFPS.args = { fps: 10 };

export const NoAutostart = Template.bind({});
NoAutostart.args = { autoStartScanning: false };

export const SmallerVideo = Template.bind({});
SmallerVideo.args = { videoMaxWidthPx: 320 };

export const Default = Template.bind({});
Default.args = {};
