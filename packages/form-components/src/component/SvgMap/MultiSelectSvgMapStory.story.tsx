import * as React from 'react';
import { useCallback } from 'react';
import { Meta, Story } from '@storybook/react';
import SingleSelectSvgMap from './SingleSelectSvgMap';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

import MultiSelectSvgMap, { MultiSelectSvgMapProps } from './MultiSelectSvgMap';

export default {
    title: 'Components/MultiSelectSvgMap',
    component: MultiSelectSvgMap,
} as Meta;

const Template: Story<MultiSelectSvgMapProps> = (props) => {
    const [, updateArgs] = useArgs();
    const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
    const handleChange = (value: string[] | undefined) => {
        updateArgs({ value });
        logAction(value);
    };
    return <MultiSelectSvgMap {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    value: undefined,
};

export const Body = Template.bind({});
Body.args = {
    ...Default.args,
    map: 'Body',
};

export const Emotion = Template.bind({});
Emotion.args = {
    ...Default.args,
    map: 'Emotion',
};

export const PainScale = Template.bind({});
PainScale.args = {
    ...Default.args,
    map: 'PainScale',
};
