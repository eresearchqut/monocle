import React, { useCallback } from 'react';

import { Meta, Story } from '@storybook/react';
import { InputCalendarCell } from './InputCalendarCell';
import { CellProps } from '@jsonforms/core';
import { useArgs } from '@storybook/client-api';
import { action } from '@storybook/addon-actions';

export default {
    title: 'Cells/InputCalendarCell',
    component: InputCalendarCell,
    argTypes: {
        data: { control: 'text' },
    },
} as Meta;

const Template: Story<CellProps> = (props) => {
    const [, updateArgs] = useArgs();
    const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
    const handleChange = (path: string, data: any) => {
        updateArgs({ data });
        logAction(path, data);
    };
    return <InputCalendarCell {...props} handleChange={handleChange} />;
};
Template.bind({});

export const Date = Template.bind({});
Date.args = {
    data: '2021-06-30',
    id: 'cell',
    config: {
        locale: 'en-AU',
    },
    schema: {
        type: 'string',
        format: 'date',
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
    },
};

export const Invalid = Template.bind({});
Invalid.args = {
    ...Date.args,
    isValid: false,
};

export const Disabled = Template.bind({});
Disabled.args = {
    ...Date.args,
    enabled: false,
};

export const NotVisible = Template.bind({});
NotVisible.args = {
    ...Date.args,
    visible: false,
};

export const HideCalendarIcon = Template.bind({});
HideCalendarIcon.args = {
    ...Date.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            hideCalendarIcon: true,
        },
    },
};

export const Time = Template.bind({});
Time.args = {
    data: '23:59:00.000Z',
    id: 'cell',
    config: {
        locale: 'en-AU',
    },
    schema: {
        type: 'string',
        format: 'time',
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
    },
};

export const TimeStepHours = Template.bind({});
TimeStepHours.args = {
    ...Time.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            stepHours: 2,
        },
    },
};

export const TimeStepMinutes = Template.bind({});
TimeStepMinutes.args = {
    ...Time.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            stepMinutes: 30,
        },
    },
};

export const TimeIncludeSeconds = Template.bind({});
TimeIncludeSeconds.args = {
    ...Time.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            includeSeconds: true,
        },
    },
};

export const TimeStepSeconds = Template.bind({});
TimeStepSeconds.args = {
    ...Time.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            includeSeconds: true,
            stepSeconds: 15,
        },
    },
};

export const TimeIncludeMilliseconds = Template.bind({});
TimeIncludeMilliseconds.args = {
    ...Time.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            includeSeconds: true,
            includeMilliseconds: true,
        },
    },
};

export const TimeStepMilliseconds = Template.bind({});
TimeStepMilliseconds.args = {
    ...Time.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            includeSeconds: true,
            includeMilliseconds: true,
            stepMilliseconds: 100,
        },
    },
};

export const DateTime = Template.bind({});
DateTime.args = {
    data: '2021-06-30T23:59:00.000Z',
    id: 'cell',
    config: {
        locale: 'en-AU',
    },
    schema: {
        type: 'string',
        format: 'date-time',
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
    },
};
