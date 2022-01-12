import * as React from 'react';
import {Meta, Story} from '@storybook/react';
import User, {UserProps} from './User';

export default {
    title: 'Components/User',
    component: User,
} as Meta;

const Template: Story<UserProps> = (props) => <User {...props} />;
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    user: {
        "enabled": true,
        "created": "2021-03-26T05:26:32.470Z",
        "lastModified": "2021-12-03T04:40:25.274Z",
        "status": "EXTERNAL_PROVIDER",
        "username": "markiemark",
        "attributes": {
            "sub": "41fa62c9-235c-4941-8fc1-e86bdff8b70e",
            "identities": [
                {
                    "userId": "markiemark",
                    "providerName": "QUT-Test",
                    "providerType": "SAML",
                    "issuer": "https://auth-test-idp.qut.edu.au/idp/shibboleth",
                    "primary": true,
                    "dateCreated": 1616736392464
                }
            ],
            "custom:qutIdentityId": "76c65a59-1c57-489b-be96-020ceaa9675a",
            "custom:uid": "markiemark"
        }
    }
};

