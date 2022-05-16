import React, { FunctionComponent } from 'react';
import startCase from 'lodash/startCase';
import { classNames } from 'primereact/utils';
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
    user: User;
}

export interface HandlerPropsOfUser {

}

export interface UserProps extends StatePropsOfUser, HandlerPropsOfUser {

}


export const User: FunctionComponent<UserProps> = (props) => {


    const renderTable = (value: any) =>
        <dl>
            {Object.keys(value).map(key =>
                <React.Fragment key={key}>
                    <dt title={key}>{startCase(key)}</dt>
                    <dd>{renderValue(value[key])}</dd>
                </React.Fragment>,
            )}
        </dl>;

    const renderValue = (value: any) => {
        switch (typeof value) {
            case 'object':
                return renderTable(value);
            case 'boolean':
                return <i className={classNames('pi', {
                    'true-icon pi-check-circle': value,
                    'false-icon pi-times-circle': !value,
                })} />;
            default:
                return renderDate(value);
        }
    };

    const isValidDate = (date: Date) =>
        date instanceof Date && date.toString() !== 'Invalid Date';


    const renderDate = (value: string | number) => {
        if (isValidDate(new Date(value))) {
            return new Date(value).toLocaleString();
        }
        return value;

    };


    return (
        <div className={'definition-table'}>
            {renderTable(props.user)}
        </div>
    );
};

export default User;
