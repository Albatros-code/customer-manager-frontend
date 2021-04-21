import React from "react";
import { connect } from "react-redux";
import {useParams} from 'react-router-dom';

import DatabaseTable from "../components/DatabaseTable";
import UserDetails from "../components/UserDetails";

const AdminUsers = (props) => {

    // const userID = "607af83e41351f47327c18f3"
    // const userId = null
    const {userId} = useParams()
    
    const columns = (searchProps) => [
        {
            title: 'Last Name',
            dataIndex: ['data','lname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            filteredValue: userId ? [''] : null,
            ...searchProps(['data','lname']),
        },
        {
            title: 'First Name',
            dataIndex: ['data','fname'],
            sorter: true,
            ellipsis: true,
            width: 140,
            filteredValue: userId ? [''] : null,
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
                defaultItemSelected={userId}
            />
        </>
    )
}

const mapStateToProps = (state) => ({
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminUsers)