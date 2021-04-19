import React from "react";
import { connect } from "react-redux";

import DatabaseTable from "../components/DatabaseTable";

const AdminUsers = () => {
    
    const columns = (searchProps) => [
        {
            title: 'Last Name',
            dataIndex: ['data','lname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...searchProps(['data','lname']),
        },
        {
            title: 'First Name',
            dataIndex: ['data','fname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...searchProps(['data','fname']),
        },
        {
            title: 'Username',
            dataIndex: ['username'],
            ellipsis: true,
            width: 135,
            ...searchProps(['username']),
        },
        {
            title: 'Email',
            dataIndex: ['data','email'],
            ellipsis: true,
            width: 200,
            ...searchProps(['data','email']),
        },
        {
            title: 'Phone',
            dataIndex: ['data','phone'],
            width: 120,
            ...searchProps(['data','phone']),
        },
    ]

    return (
        <>
            <h1>Users</h1>
            <DatabaseTable 
                columns={columns}
                dataUrl={'/users'}
            />
        </>
    )
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminUsers)