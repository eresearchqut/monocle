import React, {FunctionComponent} from 'react';
import startCase from 'lodash/startCase';
import '../../style/definition-table.scss';

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

    const {username, enabled, status, created, lastModified, attributes} = props.user;
    const attibuteKeys = Object.keys(attributes);

    const renderTable = (value: object) =>
        <dl>
            {Object.keys(value).map(key =>
                <React.Fragment>
                    <dt title={key}>{startCase(key)}</dt>
                    <dd>{ typeof value[key] === 'object' ? renderTable(value[key]) : value[key]}</dd>
                </React.Fragment>
            )}
        </dl>



    return (
        <div className={'definition-table'}>
            {renderTable(props.user)}
        </div>
    );
};

export default User;
