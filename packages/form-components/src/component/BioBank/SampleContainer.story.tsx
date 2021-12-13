import * as React from 'react';
import { Meta, Story } from '@storybook/react';
import SampleContainer, { ContainerDimensions, SampleContainerProps } from './SampleContainer';

export default {
    title: 'Components/Sample Container',
    component: SampleContainer,
} as Meta;

const Template: Story<SampleContainerProps> = (props) => <SampleContainer {...props} />;

export const FewSamples5By5 = Template.bind({});
FewSamples5By5.args = {
    dimensions: {
        width: 5,
        length: 5,
    },
    samples: [
        { row: 0, col: 0, id: 'top left' },
        { row: 0, col: 4, id: 'top right' },
        { row: 2, col: 2, id: 'center' },
        { row: 4, col: 0, id: 'bottom left' },
        { row: 4, col: 4, id: 'bottom right' },
    ],
};

export const FewSamples7By4 = Template.bind({});
FewSamples7By4.args = {
    dimensions: {
        width: 7,
        length: 4,
    },
    samples: [
        { row: 0, col: 0, id: '1 - 1' },
        { row: 0, col: 6, id: '1 - 7' },
        { row: 1, col: 1, id: '2 - 2' },
        { row: 1, col: 5, id: '2 - 6' },
        { row: 2, col: 2, id: '3 - 3' },
        { row: 2, col: 4, id: '3 - 5' },
        { row: 3, col: 3, id: '4 - 4', highlighted: true },
    ],
};

export const FewSamples30By30 = Template.bind({});
FewSamples30By30.args = {
    dimensions: {
        width: 30,
        length: 30,
    },
    samples: [
        { row: 13, col: 14, id: 'sample A' },
        { row: 13, col: 16, id: 'sample B' },
        { row: 15, col: 15, id: 'sample C', highlighted: true },
        { row: 17, col: 13, id: 'sample D' },
        { row: 17, col: 17, id: 'sample H' },
        { row: 18, col: 14, id: 'sample E' },
        { row: 18, col: 15, id: 'sample F' },
        { row: 18, col: 16, id: 'sample G' },
    ],
};

export const OneSample6By2 = Template.bind({});
OneSample6By2.args = {
    dimensions: {
        width: 6,
        length: 2,
    },
    samples: [{ row: 0, col: 1, id: 'sample 1' }],
};

export const OneSample10By1 = Template.bind({});
OneSample10By1.args = {
    dimensions: {
        width: 10,
        length: 1,
    },
    samples: [{ row: 0, col: 1, id: 'sample 1' }],
};

export const OneSample1By10 = Template.bind({});
OneSample1By10.args = {
    dimensions: {
        width: 1,
        length: 10,
    },
    samples: [{ row: 1, col: 0, id: 'sample 1' }],
};

// TODO - I'm not sure we should pass in the maxWidth like this
// maybe just keep the width of everyting at 100% and use parent div
// to control size and justify content
export const OneSample1By10WithMaxwidth = Template.bind({});
OneSample1By10WithMaxwidth.args = {
    dimensions: {
        width: 1,
        length: 10,
    },
    maxWidth: '200px',
    samples: [{ row: 1, col: 0, id: 'sample 1' }],
};

export const Default = Template.bind({});
Default.args = {
    dimensions: {
        width: 10,
        length: 10,
    },
    samples: [
        { row: 0, col: 0, id: 'sample 1' },
        { row: 0, col: 9, id: 'sample 2' },
        { row: 2, col: 3, id: 'sample 3', highlighted: true },
        { row: 2, col: 9, id: 'sample 4' },
        { row: 3, col: 2, id: 'sample 5' },
        { row: 3, col: 4, id: 'sample 6' },
        { row: 5, col: 3, id: 'sample 7' },
        { row: 9, col: 0, id: 'sample 8' },
        { row: 9, col: 9, id: 'sample 9' },
    ],
};
