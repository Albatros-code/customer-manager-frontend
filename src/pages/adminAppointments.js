import React from "react";
import { connect } from "react-redux";

import DatabaseTable from "../components/DatabaseTable";
import AppointmentsDetails from "../components/AppointmentsDetails";
import {dayjsExtended as dayjs} from '../util/util'

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const AdminAppointments = (props) => {
    const {services} = props
    
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
            title: 'Date',
            dataIndex: ['date'],
            sorter: true,
            ellipsis: true,
            width: 150,
            render: (text, record, index) => dayjs(record.date).tz().format('DD-MM-YYYY HH:mm'),
            ...searchProps(['date'], 'date'),
        },
        {
            title: 'Service',
            dataIndex: ['service'],
            sorter: true,
            ellipsis: true,
            render: (text, record, index) => {
                const serviceDoc = services ? services.find((item) => item.id === text) : null
                return serviceDoc ? serviceDoc.name : "deleted " + text
            },
            width: 300,
            ...searchProps(['service']),
        },
    ]

    const itemDetails = (record, setVisible) => {
        if (!record) return null
        const serviceDoc = services ? services.find((item) => item.id === record.service) : null
        const serviceName = serviceDoc ? serviceDoc.name : "deleted " + record.service
        const title = serviceName + ' on ' + dayjs(record.date).tz().format('DD-MM-YYYY')

        return (
            [<>
                <AppointmentsDetails 
                    doc={record}
                    setVisible={setVisible}
                />
            </>, title]
        )
    } 

    return (
        <>
            <h1>Appointments</h1>
            <DatabaseTable 
                columns={columns}
                dataUrl={'/appointments'}
                itemDetails={itemDetails}
                useQueryParams={true}
            />
        </>
    )
}

const mapStateToProps = (state) => ({
    services: state.data.services
})

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminAppointments)