import React from "react";
import { connect } from "react-redux";

import DatabaseTable from "../components/DatabaseTable";
import UserDetails from "../components/UserDetails";

const AdminUsers = (props) => {

    // const goToUser = React.useCallback(() => {
    //     const isActionPOP = history.action === 'POP'
    //     const showUserById = state && state.showUserById ? true : false

    //     if ((isActionPOP && userId) || (!isActionPOP && showUserById)){
    //         return userId
    //     } else {
    //         return null
    //     }
    // },[history.action, state, userId])
    
    const columns = (searchProps) => [
        {
            key: 'id',
            title: 'Id',
            dataIndex: ['id'],
            sorter: true,
            ellipsis: true,
            maxWidth: 50,
            ...searchProps(['id']),
        },
        {
            key: 'lname',
            title: 'Last Name',
            dataIndex: ['data','lname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...searchProps(['data','lname']),
        },
        {
            key: 'fname',
            title: 'First Name',
            dataIndex: ['data','fname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...searchProps(['data','fname']),
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
            ...searchProps(['data','email']),
        },
        {
            key: 'phone',
            title: 'Phone',
            dataIndex: ['data','phone'],
            width: 120,
            ...searchProps(['data','phone']),
        },
    ]

    const itemDetails = (record, setVisible) => {
        if (!record) return null

        return (
            <>
                <h2>{record.username}</h2>
                <UserDetails 
                    userDoc={record}
                />
                {/* <button onClick={() => {setVisible(false)}}>Close</button> */}
            </>
        )
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

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminUsers)