import React from 'react';
import {
    ControlProps,
    isStringControl,
    RankedTester,
    rankWith
} from '@jsonforms/core';
import {Input} from 'rsuite';
import {FormInput} from './FormInput';
import { withJsonFormsControlProps } from '@jsonforms/react';

export const InputControl = (props: ControlProps) => (
    <FormInput {...props} input={Input} />
);

export const inputControlTester: RankedTester = rankWith(
    1,
    isStringControl
);

export default withJsonFormsControlProps(InputControl);
