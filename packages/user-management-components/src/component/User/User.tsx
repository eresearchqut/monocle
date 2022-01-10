import React, { FunctionComponent } from 'react';

export interface User {
    enabled: boolean
    created: string,
    lastModified: string,
    status: string,
    username: string,
    attributes: Record<string, any>
}

export interface StatePropsOfUser {
    user: User
}

export interface HandlerPropsOfUser {

}

export interface UserProps extends StatePropsOfUser, HandlerPropsOfUser {

}


export const User: FunctionComponent<UserProps> = (props) => {

    const {username} = props.user;

    return <div className={'user-attributes'}>
        <dl>
            <dt>Username</dt>
            <dd>{username}</dd>
        </dl>
    </div>;
};

export default User;
