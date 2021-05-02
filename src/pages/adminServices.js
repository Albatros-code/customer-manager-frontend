import React from "react";
import { connect } from "react-redux";

import {getServices} from "../redux/actions/dataActions";

import DatabaseTable from "../components/DatabaseTable";

const AdminServices = () => {

    const columns = (searchProps) => [
        {
            key: 'name',
            title: 'Name',
            dataIndex: ['name'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...searchProps(['name']),
        },
        {
            key: 'time',
            title: 'Time',
            dataIndex: ['time'],
            sorter: true,
            width: 140,
        },
        {
            key: 'prize',
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
                useQueryParams={true}
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