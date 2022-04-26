import * as React from 'react';
import { useCallback } from 'react';
import { Meta, Story } from '@storybook/react';
import SingleSelectSvgMap from './SingleSelectSvgMap';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

import MultiSelectSvgMap, { MultiSelectSvgMapProps } from './MultiSelectSvgMap';
import { SvgMapSelection } from './SvgMap';

export default {
    title: 'FormComponents/Components/MultiSelectSvgMap',
    component: MultiSelectSvgMap,
} as Meta;

const Template: Story<MultiSelectSvgMapProps> = (props) => {
    const [, updateArgs] = useArgs();
    const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
    const handleChange = (value: SvgMapSelection[] | undefined) => {
        updateArgs({ value });
        logAction(value);
    };
    return <MultiSelectSvgMap {...props} handleChange={handleChange} />;
};
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
