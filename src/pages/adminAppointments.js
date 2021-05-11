import React from "react";
import { connect } from "react-redux";
import {useHistory} from 'react-router-dom';

import DatabaseTable from "../components/DatabaseTable";
import {dayjsExtended as dayjs} from '../util/util'

var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

const AdminAppointments = (props) => {
    const history = useHistory()
    
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
            width: 300,
            ...searchProps(['service']),
        },
        // {
        //     title: 'Time',
        //     dataIndex: ['date'],
        //     ellipsis: true,
        //     width: 110,
        //     render: (text, record, index) => dayjs(record.date).tz().format('HH:mm'),
        //     ...searchProps(['date']),
        // },
    ]

    const itemDetails = (record, setVisible) => {
        if (!record) return null

        return (
            <>
                <h2>{record.service} on {dayjs(record.date).tz().format('DD-MM-YYYY')}</h2>
                <p>Appointment details</p>
                <p><strong>User: </strong><button onClick={() => {history.push(`/admin/users?filter=%7B"id__icontains"%3A"${record.user}"%7D&page=1&showRow=0`)}}>{record.user}</button></p>
            </>
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
})

const mapDispatchToProps = {
    
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminAppointments)