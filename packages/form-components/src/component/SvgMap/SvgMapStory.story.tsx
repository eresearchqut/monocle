import * as React from 'react';
import { Meta, Story } from '@storybook/react';
import SvgMap, { SvgMapProps } from './SvgMap';

export default {
    title: 'Components/SvgMap',
    component: SvgMap,
} as Meta;

const Template: Story<SvgMapProps> = (props) => <SvgMap {...props} />;
Template.bind({});

export const Body = Template.bind({});
Body.args = {
    map: 'Body',
};

export const Emotion = Template.bind({});
Emotion.args = {
    map: 'Emotion',
    colorScheme: 'orange',
};

export const PainScale = Template.bind({});
PainScale.args = {
    map: 'PainScale',
};
