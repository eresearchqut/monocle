import * as React from 'react';
import { Meta, Story } from '@storybook/react';
import SingleSelectSvgMap, { SingleSelectSvgMapProps } from './SingleSelectSvgMap';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';
import { CellProps } from '@jsonforms/core';
import { useCallback } from 'react';
import { InputAddressCell } from '../../cells/InputAddressCell';

export default {
    title: 'Components/SingleSelectSvgMap',
    component: SingleSelectSvgMap,
} as Meta;

const Template: Story<SingleSelectSvgMapProps> = (props) => {
    const [, updateArgs] = useArgs();
    const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
    const handleChange = (value: string | undefined) => {
        updateArgs({ value });
        logAction(value);
    };
    return <SingleSelectSvgMap {...props} handleChange={handleChange} />;
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
    colorScheme: 'pink',
};

export const Emotion = Template.bind({});
Emotion.args = {
    ...Default.args,
    map: 'Emotion',
    colorScheme: 'orange',
};

export const PainScale = Template.bind({});
PainScale.args = {
    ...Default.args,
    map: 'PainScale',
    colorScheme: 'purple',
};
