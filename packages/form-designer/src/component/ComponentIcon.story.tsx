import * as React from 'react';

import {Meta, Story} from '@storybook/react';
import ComponentIcon, {ComponentIconProps} from './ComponentIcon';
import {InputType} from "@trrf/form-definition";

export default {
    title: 'Component/ComponentIcon',
    component: ComponentIcon,
} as Meta;

const Template: Story<ComponentIconProps> =
    (props) =>
        <ComponentIcon {...props} />;
Template.bind({});

export const Boolean = Template.bind({});
Boolean.args = {componentType: InputType.BOOLEAN};

export const Currency = Template.bind({});
Currency.args = {componentType: InputType.CURRENCY};

export const Date = Template.bind({});
Date.args = {componentType: InputType.DATE};

export const DateTime = Template.bind({});
DateTime.args = {componentType: InputType.DATE_TIME};

export const Markdown = Template.bind({});
Markdown.args = {componentType: InputType.MARKDOWN};

export const MultilineText = Template.bind({});
MultilineText.args = {componentType: InputType.MULTILINE_TEXT};

export const Numeric = Template.bind({});
Numeric.args = {componentType: InputType.NUMERIC};

export const Range = Template.bind({});
Range.args = {componentType: InputType.RANGE};

export const Text = Template.bind({});
Text.args = {componentType: InputType.TEXT};

export const Time = Template.bind({});
Time.args = {componentType: InputType.TIME};