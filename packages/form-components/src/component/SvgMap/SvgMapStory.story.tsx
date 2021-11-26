import * as React from 'react';
import { Meta, Story } from '@storybook/react';
import SvgMap, { SvgMapProps } from './SvgMap';
import maps from './maps';

export default {
    title: 'Components/SvgMap',
    component: SvgMap,
} as Meta;

const Template: Story<SvgMapProps> = (props) => <SvgMap {...props} />;
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    map: maps.body,
};
