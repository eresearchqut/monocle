import React, {useCallback} from 'react';
import {Meta, Story} from '@storybook/react';
import {CellProps} from "@jsonforms/core";
import {InputCountryCell} from "./InputCountryCell";
import {useArgs} from "@storybook/client-api";
import {action} from "@storybook/addon-actions";

export default {
    title: 'Cells/InputCountryCell',
    component: InputCountryCell,
    argTypes: {
        id: {table: {disable: true}}
    }
} as Meta;

const Template: Story<CellProps> =
    (props) => {
        const [, updateArgs] = useArgs();
        const logAction = useCallback(action('handleChange'), []); // eslint-disable-line react-hooks/exhaustive-deps
        const handleChange = (path: string, data: any) => {
            updateArgs({data});
            logAction(path, data);
        }
        return <InputCountryCell {...props} handleChange={handleChange}/>
    }
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    data: {},
    path: 'cell',
    schema: {
        type: 'object',
        properties: {
            name: {type: 'string'},
            shortCode: {type: 'string'}
        }
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
        options: {
            type: 'country'
        }
    }
}

export const CountryCodes = Template.bind({});
CountryCodes.args = {
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
        options: {
            type: 'country',
            countryCodes: ['AU', 'NZ']
        }
    }
}

export const SingleCountry = Template.bind({});
SingleCountry.args = {
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
        options: {
            type: 'country',
            countryCodes: ['AU']
        }
    }
}

export const Multiselect = Template.bind({});
Multiselect.args = {
    data: [{name: 'Australia', shortCode: 'AU'}],
    schema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: {type: 'string'},
                shortCode: {type: 'string'}
            }
        }
    },
    uischema: {
        type: 'Control',
        scope: `#/properties/cell`,
        options: {
            type: 'country',
            multiselect: true
        }
    }
}


// export const CountryCodes = Template.bind({});
// CountryCodes.args = {
//     ...Default.args,
//     uischema: {
//         type: 'Control',
//         scope: `#/properties/cell`,
//         options: {
//             type: 'address',
//             countryCodes: ['au', 'nz']
//         }
//     }
// }
//
//
//
// export const Invalid = Template.bind({});
// Invalid.args = {
//     ...Default.args,
//     isValid: false
// }
//
// export const Disabled = Template.bind({});
// Disabled.args = {
//     ...Default.args,
//     enabled: false
// }
//
// export const NotVisible = Template.bind({});
// NotVisible.args = {
//     ...Default.args,
//     visible: false
// }
//
//






