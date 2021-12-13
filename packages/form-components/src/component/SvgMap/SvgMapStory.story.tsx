import * as React from 'react';
import { Meta, Story } from '@storybook/react';
import SvgMap, { SvgMapProps } from './SvgMap';

export default {
    title: 'Components/SvgMap',
    component: SvgMap,
} as Meta;

const Template: Story<SvgMapProps> = (props) => <SvgMap {...props} />;
Template.bind({});

export const MuscleGroupsV1 = Template.bind({});
MuscleGroupsV1.args = {
    map: 'MuscleGroupsV1',
};

export const EmotionV1 = Template.bind({});
EmotionV1.args = {
    map: 'EmotionV1',
};

export const PainScaleV1 = Template.bind({});
PainScaleV1.args = {
    map: 'PainScaleV1',
};
