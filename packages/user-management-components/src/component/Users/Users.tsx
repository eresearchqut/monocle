import React, {FunctionComponent} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {classNames} from 'primereact/utils';
import {User} from '../User/User';

export interface StatePropsOfUsers {
    estimatedCountOfUsers: number;
    hasNext: boolean;
    hasPrevious: boolean;
    users: Array<User>;
}

export interface HandlerPropsOfUsers {
    onNextPage?: (event: any) => void;
    onPreviousPage?: (event: any) => void;
}

export interface UsersProps extends StatePropsOfUsers, HandlerPropsOfUsers {

}

export const Users: FunctionComponent<UsersProps> = (props) => {
    const {users} = props;
    return <DataTable value={users}>
        <Column header={'Username'} field={'username'}/>
        <Column header={'Enabled'} field={'enabled'} body={((rowData) => <i className={classNames('pi', {
            'true-icon pi-check-circle': rowData.enabled,
            'false-icon pi-times-circle': !rowData.enabled
        })}></i>)} />
        <Column header={'Status'} field={'status'} />
        <Column header={'Created'} field={'created'}/>
        <Column header={'Last Modified'} field={'lastModified'}/>
    </DataTable>;
};

export default Users;
