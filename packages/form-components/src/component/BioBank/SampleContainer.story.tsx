import * as React from 'react';
import { Meta, Story } from '@storybook/react';
import SampleContainer, { ContainerDimensions, SampleContainerProps } from './SampleContainer';

export default {
    title: 'Components/Sample Container',
    component: SampleContainer,
} as Meta;

const Template: Story<SampleContainerProps> = (props) => <SampleContainer {...props} />;

function dimensions(width: number, length: number): SampleContainerProps {
    return {
        dimensions: { width: width, length: length },
        samples: [],
    };
}

export const Empty5By5 = Template.bind({});
Empty5By5.args = dimensions(5, 5);

export const Empty10By10 = Template.bind({});
Empty10By10.args = dimensions(10, 10);

export const Empty30By30 = Template.bind({});
Empty30By30.args = dimensions(30, 30);

export const Empty2By6 = Template.bind({});
Empty2By6.args = dimensions(2, 6);

export const Empty1By10 = Template.bind({});
Empty1By10.args = dimensions(1, 10);

export const Empty10By1 = Template.bind({});
Empty10By1.args = dimensions(10, 1);

export const OneSample2By6 = Template.bind({});
OneSample2By6.args = {
    dimensions: {
        width: 2,
        length: 6,
    },
    samples: [{ x: 1, y: 0, id: 'sample1' }],
};

export const OneSample10By10 = Template.bind({});
OneSample10By10.args = {
    dimensions: {
        width: 10,
        length: 10,
    },
    samples: [{ x: 3, y: 0, id: 'sample1' }],
};

export const Default = Template.bind({});
Default.args = {
    dimensions: {
        width: 10,
        length: 10,
    },
    samples: [
        { x: 0, y: 0, id: 'sample1' },
        { x: 9, y: 0, id: 'sample2' },
        { x: 3, y: 2, id: 'sample3', highlighted: true },
        { x: 2, y: 3, id: 'sample4' },
    ],
};
