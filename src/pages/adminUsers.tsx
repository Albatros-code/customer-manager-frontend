import DatabaseTable from "../components/DatabaseTable";
import UserDetails from "../components/UserDetails";

// types
import { IDatabaseTable } from "../components/DatabaseTable";
import { IUserDoc } from "../interfaces";


const AdminUsers = () => {
    
    const columns: IDatabaseTable<IUserDoc>['columns'] = (searchProps) => [
        {
            key: 'id',
            title: 'Id',
            dataIndex: ['id'],
            // sorter: true,
            ellipsis: true,
            width: 70,
            ...searchProps(['id']),
        },
        {
            key: 'lname',
            title: 'Last Name',
            dataIndex: ['data','lname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...searchProps(['data','lname'], '', 'last name'),
        },
        {
            key: 'fname',
            title: 'First Name',
            dataIndex: ['data','fname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...searchProps(['data','fname'], '', 'first name'),
        },
        {
            key: 'username',
            title: 'Username',
            dataIndex: ['username'],
            ellipsis: true,
            width: 135,
            ...searchProps(['username']),
        },
        {
            key: 'email',
            title: 'Email',
            dataIndex: ['data','email'],
            ellipsis: true,
            width: 200,
            ...searchProps(['data','email'], '', 'email'),
        },
        {
            key: 'phone',
            title: 'Phone',
            dataIndex: ['data','phone'],
            width: 120,
            ...searchProps(['data','phone'], '', 'phone'),
        },
    ]

    const itemDetails: IDatabaseTable<IUserDoc>['itemDetails'] = (record, setVisible) => {
        if (!record) return null
        const title = 'Details of ' + record.data.fname + ' ' + record.data.lname
        return ([
            <>
                <UserDetails 
                    doc={record}
                    setVisible={setVisible}
                />
            </>, title
        ])
    } 
    
    return (
        <>
            <h1>Users</h1>
    
            <DatabaseTable 
                columns={columns}
                dataUrl={'/users'}
                itemDetails={itemDetails}
                useQueryParams={true}             
            />
        </>
    )
}

export default AdminUsers