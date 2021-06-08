import React from "react";
import { connect } from "react-redux";

import {getServices} from "../redux/actions/dataActions";

import ServicesDetails from "../components/ServiceDetails";
import DatabaseTable from "../components/DatabaseTable";
import AddDoc from "../components/AddDoc";

import {serviceModel} from '../util/data';
import {useForceUpdate} from '../util/hooks'

const AdminServices = () => {

    const {forceUpdate, update} = useForceUpdate()
    

    const columns = (searchProps) => [
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
            key: 'name',
            title: 'Name',
            dataIndex: ['name'],
            sorter: true,
            ellipsis: true,
            width: 140,
            ...searchProps(['name']),
        },
        {
            key: 'duration',
            title: 'Duration',
            dataIndex: ['duration'],
            sorter: true,
            width: 80,
        },
        {
            key: 'price',
            title: 'Price',
            dataIndex: ['price'],
            width: 70,
        },
    ]

    const itemDetails = (record, setVisible) => {
        if (!record) return null
        const title = record.name

        return (
            [<>
                <ServicesDetails 
                    doc={record}
                    setVisible={setVisible}
                />
            </>, title]
        )
    }

    return (
        <>
            <div className="page-title">
                <h1>Services</h1>
                <AddDoc
                    buttonStyle={{display: "inline-block", float: "right"}} 
                    label="Add Service"
                    forceUpdate={forceUpdate}
                    dataModel={serviceModel}
                    apiUrl="/services-admin"
                />
            </div>
            
            <DatabaseTable
                forceUpdate={update}
                columns={columns}
                dataUrl={'/services-admin'}
                useQueryParams={true}
                itemDetails={itemDetails}
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