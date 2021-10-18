import * as React from 'react';

import {Meta, Story} from '@storybook/react';
import ComponentIcon, {ComponentIconProps} from './ComponentIcon';

export default {
    title: 'Component/ComponentIcon',
    component: ComponentIcon,
} as Meta;

const Template: Story<ComponentIconProps> =
    (props) =>
        <ComponentIcon {...props} />;
Template.bind({});

export const Date = Template.bind({});
Date.args = {inputType: 'date'};


