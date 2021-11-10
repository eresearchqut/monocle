import React from 'react';
import { CellProps, optionIs, RankedTester, rankWith } from '@jsonforms/core';
import { withJsonFormsCellProps } from '@jsonforms/react';
import merge from 'lodash/merge';
import { Captcha } from 'primereact/captcha';

export interface InputCaptchaCellOptions {
    siteKey: string;
}

export const InputCaptchaCell = (props: CellProps) => {
    const { config, handleChange, path, uischema, visible = true } = props;

    const { siteKey } = merge({}, config, uischema?.options) as InputCaptchaCellOptions;

    if (!visible) {
        return null;
    }

    return <Captcha siteKey={siteKey} onResponse={(response) => handleChange(path, response.response)} />;
};

export const inputCaptchaCellTester: RankedTester = rankWith(2, optionIs('type', 'captcha'));

export default withJsonFormsCellProps(InputCaptchaCell);
