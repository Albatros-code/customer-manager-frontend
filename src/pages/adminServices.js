import React from "react";
import { connect } from "react-redux";

import {getServices} from "../redux/actions/dataActions";

import DatabaseTable from "../components/DatabaseTable";

const AdminServices = () => {

    const columns = (searchProps) => [
        {
            title: 'Name',
            dataIndex: ['name'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...searchProps(['name']),
        },
        {
            title: 'Time',
            dataIndex: ['time'],
            sorter: true,
            width: 140,
        },
        {
            title: 'Prize',
            dataIndex: ['prize'],
            width: 135,
        },
    ]

    return (
        <>
            <h1>Services</h1>
            <DatabaseTable 
                columns={columns}
                dataUrl={'/services-admin'}
            />
        </>
    )
}

const mapStateToProps = (state) => ({
    services: state.data.services
})

const mapDispatchToProps = {
    getServices
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminServices)