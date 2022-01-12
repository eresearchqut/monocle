import * as React from 'react';
import { Meta, Story } from '@storybook/react';
import Users, { UsersProps } from './Users';

export default {
    title: 'Components/Users',
    component: Users,
} as Meta;

const Template: Story<UsersProps> = (props) => <Users {...props} />;
Template.bind({});

export const Default = Template.bind({});
Default.args = {
    estimatedCountOfUsers: 10,
    users: [
        {
            "enabled": true,
            "created": "2021-03-26T05:26:32.470Z",
            "lastModified": "2021-12-03T04:40:25.274Z",
            "status": "EXTERNAL_PROVIDER",
            "username": "don-johnson",
            "attributes": {
                "sub": "41fa62c9-235c-4941-8fc1-e86bdff8b70e",
                "identities": [
                    {
                        "userId": "don-johnson",
                        "providerName": "QUT-Test",
                        "providerType": "SAML",
                        "issuer": "https://auth-test-idp.qut.edu.au/idp/shibboleth",
                        "primary": true,
                        "dateCreated": 1616736392464
                    }
                ],
                "custom:qutIdentityId": "76c65a59-1c57-489b-be96-020ceaa9675a",
                "custom:uid": "don-johnson"
            }
        },
        {
            "enabled": false,
            "created": "2021-10-11T23:47:08.863Z",
            "lastModified": "2021-10-11T23:47:08.863Z",
            "status": "EXTERNAL_PROVIDER",
            "username": "odoyle",
            "attributes": {
                "sub": "16e4e10e-c4a7-45d2-978c-113d57b67324",
                "identities": [
                    {
                        "userId": "odoyle",
                        "providerName": "QUT-Test",
                        "providerType": "SAML",
                        "issuer": "https://auth-test-idp.qut.edu.au/idp/shibboleth",
                        "primary": true,
                        "dateCreated": 1633996028849
                    }
                ],
                "custom:qutIdentityId": "0b49e501-99ca-4c3c-9505-fb22c8f5d588",
                "custom:uid": "odoyle"
            }
        },
        {
            "enabled": true,
            "created": "2021-10-27T22:25:48.965Z",
            "lastModified": "2021-10-27T22:25:48.965Z",
            "status": "EXTERNAL_PROVIDER",
            "username": "dwayne-johnson",
            "attributes": {
                "sub": "a5fde4bd-7d20-471c-8538-31743e8a334f",
                "identities": [
                    {
                        "userId": "dwayne-johnson",
                        "providerName": "QUT-Test",
                        "providerType": "SAML",
                        "issuer": "https://auth-test-idp.qut.edu.au/idp/shibboleth",
                        "primary": true,
                        "dateCreated": 1635373548956
                    }
                ],
                "custom:qutIdentityId": "5f23ab06-91eb-42b8-ac2a-623f7e66c911",
                "custom:uid": "dwayne-johnson"
            }
        },
        {
            "enabled": true,
            "created": "2021-11-03T04:12:02.851Z",
            "lastModified": "2021-11-03T04:13:16.604Z",
            "status": "EXTERNAL_PROVIDER",
            "username": "dare-devil",
            "attributes": {
                "sub": "5e377ea8-d6f0-46c4-86cd-a16bbac026f0",
                "identities": [
                    {
                        "userId": "dare-devil",
                        "providerName": "QUT-Test",
                        "providerType": "SAML",
                        "issuer": "https://auth-test-idp.qut.edu.au/idp/shibboleth",
                        "primary": true,
                        "dateCreated": 1635912722842
                    }
                ],
                "custom:qutIdentityId": "41dcb900-1524-48b3-8845-cf771b2b40bd",
                "custom:uid": "dare-devil"
            }
        }
    ],
};

