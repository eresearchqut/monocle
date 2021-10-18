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
Boolean.args = {inputType: InputType.BOOLEAN};

export const Currency = Template.bind({});
Currency.args = {inputType: InputType.CURRENCY};

export const Date = Template.bind({});
Date.args = {inputType: InputType.DATE};

export const DateTime = Template.bind({});
DateTime.args = {inputType: InputType.DATE_TIME};

export const Markdown = Template.bind({});
Markdown.args = {inputType: InputType.MARKDOWN};

export const MultilineText = Template.bind({});
MultilineText.args = {inputType: InputType.MULTILINE_TEXT};

export const Numeric = Template.bind({});
Numeric.args = {inputType: InputType.NUMERIC};

export const Range = Template.bind({});
Range.args = {inputType: InputType.RANGE};

export const Text = Template.bind({});
Text.args = {inputType: InputType.TEXT};

export const Time = Template.bind({});
Time.args = {inputType: InputType.TIME};