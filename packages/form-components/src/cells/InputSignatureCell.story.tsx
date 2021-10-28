import React, {useCallback} from 'react';
import {Meta, Story} from '@storybook/react';
import {EnumCellProps} from "@jsonforms/core";
import {InputSignatureCell} from "./InputSignatureCell";
import {useArgs} from "@storybook/client-api";
import {action} from "@storybook/addon-actions";

export default {
    title: 'Cells/InputSignatureCell',
    component: InputSignatureCell
} as Meta;

const Template: Story<EnumCellProps> =
    (props) => {
        const [, updateArgs] = useArgs();
        const logAction = useCallback(action('handleChange'), []);
        const handleChange = (path: string, data: any) => {
            updateArgs({data});
            logAction(path, data);
        }
        return <InputSignatureCell {...props} handleChange={handleChange}/>
    }
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: '',
    id: 'cell',
    path: 'cell',
    schema: {
        type: 'signature'
    },
    uischema: {
        type: 'Control',
        scope: '#/properties/cell'
    }
}

export const LoadSaved = Template.bind({});
LoadSaved.args = {
    ...Default.args,
    data: 'data:image/png;base64,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'
}

export const MimeTypeJpeg = Template.bind({});
MimeTypeJpeg.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            mimeType: 'image/jpeg'
        }
    }
}

export const MimeTypeSvg = Template.bind({});
MimeTypeSvg.args = {
    ...Default.args,
    uischema: {
        type: 'Control',
        scope: '#/properties/cell',
        options: {
            mimeType: 'image/svg+xml'
        }
    }
}



export const NotValid = Template.bind({});
NotValid.args = {
    ...Default.args,
    isValid: false
}

export const NotVisible = Template.bind({});
NotVisible.args = {
    ...Default.args,
    visible: false
}

export const Disabled = Template.bind({});
Disabled.args = {
    ...Default.args,
    enabled: false
}
